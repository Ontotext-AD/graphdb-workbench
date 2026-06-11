import {createElement} from 'react';
import {createRoot, Root} from 'react-dom/client';
import {
  DefaultWorkspace,
  OwlRdfsSettings,
  SerializedDiagram,
  SparqlDataProvider,
  SparqlDataProviderSettings,
  SparqlQueryFunction,
  useLoadedWorkspace,
  Workspace,
  WorkspaceContext,
} from '@reactodia/workspace';
// The synchronous, main-thread layout. We use it instead of the worker-based
// `defineLayoutWorker(() => new Worker(new URL('@reactodia/workspace/layout.worker', ...)))`
// because Stencil's Rollup pipeline does not bundle the `new Worker(new URL(...))` pattern
// (it leaves the bare specifier in the output, which then 404s at runtime). This is the same
// algorithm the worker runs, just on the main thread.
import {blockingDefaultLayout} from '@reactodia/workspace/layout-sync';

import frTranslation from './i18n/fr.reactodia.translation.json';

/**
 * Reactodia ships English as its built-in default bundle, so English needs no override.
 * Other languages are layered on top as partial bundles; unknown codes fall back to English.
 *
 * Reactodia bakes these bundles into the {@link Workspace} when it is constructed and never
 * re-reads them (its translation lookup has no language parameter), so the host must remount
 * the component to switch the UI language (handled in `onto-reactodia-graph.tsx`).
 */
function translationsForLanguage(language: string): readonly object[] {
  return language === 'fr' ? [frTranslation] : [];
}

/**
 * Props for the internal Reactodia React application.
 */
export interface ReactodiaAppProps {
  /**
   * The active repository id. Passed to {@link SparqlDataProvider} as its `endpointUrl` and
   * surfaced to {@link queryFunction} as the request `url`, which the host transport uses to
   * target the repository. Changing it re-points the diagram at a different repository.
   */
  currentRepository: string;
  /**
   * Transport for the SPARQL requests. The host owns the connection (auth, interceptors,
   * base URL) inside this function; Reactodia delegates every SPARQL call to it instead
   * of using the built-in `fetch`.
   */
  queryFunction: SparqlQueryFunction;
  /**
   * UI language code (e.g. `en`, `fr`); selects the Reactodia translation bundle
   * and is also used as the initial graph-data language.
   * Reactodia reads the bundle only when the {@link Workspace} is constructed, so the host
   * must remount the component to apply a language change (see `onto-reactodia-graph.tsx`).
   */
  language: string;
  /**
   * A previously exported diagram to restore on mount. Used to carry the user's current
   * canvas across the remount that a language change forces, so switching the UI language
   * does not wipe their work. When omitted, the canvas starts empty.
   */
  initialDiagram?: SerializedDiagram;
  /**
   * Query preset for the SPARQL data provider. Lets the host supply user-edited settings
   * (see the settings editor in `onto-reactodia-graph.tsx`); falls back to
   * {@link defaultGraphDbSettings} when omitted.
   */
  providerSettings?: SparqlDataProviderSettings;
}

/**
 * The workspace context captured from the Workspace `ref` once it mounts.
 * Used to drive the diagram imperatively from {@link updateReactodia}, which
 * runs outside React and therefore cannot call the `useWorkspace` hook.
 */
let workspaceContext: WorkspaceContext | null = null;

/**
 * Default query preset for the SPARQL data provider.
 *
 * {@link OwlRdfsSettings} is the generic OWL/RDFS query preset and a sensible default
 * for a GraphDB repository. We extend it instead of using it verbatim so the class tree
 * also surfaces classes that are only referenced as instance types and so labels can come
 * from `schema:name`/`skos:prefLabel` in addition to `rdfs:label`. The extra prefixes are
 * appended to `defaultPrefix` because the stock preset only declares `rdfs`, `rdf` and `owl`.
 *
 * Exported so the host component can show the defaults in its settings editor and pass
 * user-modified copies back via {@link ReactodiaAppProps.providerSettings}.
 */
export const defaultGraphDbSettings: SparqlDataProviderSettings = {
  ...OwlRdfsSettings,
  defaultPrefix: `${OwlRdfsSettings.defaultPrefix}
 PREFIX schema: <http://schema.org/>
 PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
`,
  classTreeQuery: `
        SELECT ?class ?label ?parent
        WHERE {
            {
                ?class a rdfs:Class
            } UNION {
                ?class a owl:Class
            }
            UNION {
                ?_ a ?class.
            }
            FILTER ISIRI(?class)
            OPTIONAL {
                ?class rdfs:label | schema:name | skos:prefLabel ?label
                \${labelLanguageFilter}
            }
            OPTIONAL {?class rdfs:subClassOf ?parent. FILTER ISIRI(?parent)}
        }
    `,
};

/**
 * Builds a Reactodia {@link SparqlDataProvider} for the given endpoint using the
 * given query preset, defaulting to {@link defaultGraphDbSettings}.
 */
function createDataProvider(
  currentRepository: string,
  queryFunction: SparqlQueryFunction,
  settings: SparqlDataProviderSettings = defaultGraphDbSettings
): SparqlDataProvider {
  return new SparqlDataProvider({
    endpointUrl: currentRepository,
    queryMethod: 'POST',
    queryFunction,
  }, settings);
}

/**
 * The Reactodia workspace React component.
 *
 * Authored with `React.createElement` (no JSX) on purpose: the Stencil project's
 * tsconfig compiles JSX with the Stencil `h` factory, which is incompatible with React.
 *
 * The canvas starts empty; the user populates it through the workspace search bar
 * (Reactodia's `DefaultWorkspace` unified search), which is backed by the SPARQL
 * data provider's lookup.
 */
function ReactodiaApp(props: ReactodiaAppProps) {
  const {currentRepository, queryFunction, language, initialDiagram, providerSettings} = props;

  const {onMount} = useLoadedWorkspace(async ({context, signal}) => {
    workspaceContext = context;
    const {model} = context;
    const dataProvider = createDataProvider(currentRepository, queryFunction, providerSettings);
    // A language change remounts this component to rebuild the workspace with the new
    // translation bundle; restoring the exported diagram keeps the user's canvas intact.
    // This is done because there is no existing mechanism to re-translate the UI at runtime (not for the UI labels at least)
    if (initialDiagram) {
      await model.importLayout({dataProvider, diagram: initialDiagram, signal});
    } else {
      await model.createNewDiagram({dataProvider, signal});
    }
  }, [language]);

  /**
   * From the documentation
   *
   * return (
   *     <Reactodia.Workspace ref={onMount}
   *       defaultLayout={defaultLayout}>
   *       <Reactodia.DefaultWorkspace />
   *     </Reactodia.Workspace>
   *   );
   */
  return createElement(
    Workspace,
    // `ref` is a valid prop for the Workspace class component but is not part of
    // WorkspaceProps, so the props object is cast to satisfy createElement's typing.
    // `translations` localizes the UI strings; `defaultLanguage` sets the initial
    // graph-data label language to match.
    {
      ref: onMount,
      defaultLayout: blockingDefaultLayout,
      defaultLanguage: language,
      translations: translationsForLanguage(language)
    } as never,
    createElement(DefaultWorkspace, {})
  );
}

/**
 * Mounts the Reactodia application into the given container and returns the React root.
 */
export function mountReactodia(container: HTMLElement, props: ReactodiaAppProps): Root {
  const root = createRoot(container);
  root.render(createElement(ReactodiaApp, props));
  return root;
}

/**
 * Re-points the diagram at a new SPARQL endpoint or query preset by recreating it
 * with a fresh data provider. The canvas is reset to empty, matching the initial mount.
 */
export async function updateReactodia(props: ReactodiaAppProps): Promise<void> {
  if (!workspaceContext) {
    return;
  }
  const {model} = workspaceContext;
  const dataProvider = createDataProvider(props.currentRepository, props.queryFunction, props.providerSettings);
  await model.createNewDiagram({dataProvider});
}

/**
 * Serializes the current diagram so it can be restored after a remount (e.g. when a
 * language change rebuilds the workspace). Returns `undefined` if nothing is mounted yet.
 */
export function exportReactodiaLayout(): SerializedDiagram | undefined {
  return workspaceContext?.model.exportLayout();
}

/**
 * Unmounts the Reactodia application.
 */
export function unmountReactodia(root: Root): void {
  root.unmount();
}
