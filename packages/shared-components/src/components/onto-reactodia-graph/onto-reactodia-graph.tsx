import {Component, h, Host, Prop, State, Watch} from '@stencil/core';
import {Root} from 'react-dom/client';
import {SparqlQueryFunction, SerializedDiagram, SparqlDataProviderSettings} from '@reactodia/workspace';
import {
  defaultGraphDbSettings,
  exportReactodiaLayout,
  mountReactodia,
  unmountReactodia,
  updateReactodia,
} from './reactodia-app';

/**
 * The string-valued provider settings (the SPARQL query/pattern templates) — the ones
 * meaningfully editable in a textarea. The non-string settings keep their defaults.
 * The values are trimmed because the defaults are authored as indented template literals
 * and carry their surrounding code indentation; SPARQL is whitespace-insensitive.
 */
function stringSettings(settings: SparqlDataProviderSettings): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(settings)) {
    if (typeof value === 'string') {
      result[key] = value.trim();
    }
  }
  return result;
}

/**
 * A web component that renders a graph with the Reactodia workspace.
 *
 * The component is backed by a SPARQL endpoint but is endpoint-agnostic: the host passes
 * the active repository's endpoint via `current-repository` and a `queryFunction` that
 * performs the actual HTTP request. Reactodia fetches all node, link and type data lazily
 * through them; the canvas starts empty and the user populates it via the search bar.
 *
 * This is a proof of concept; the component and its Reactodia wrapper are written so
 * they can later be extracted into a standalone package and consumed here as an NPM
 * dependency. A bare-bones settings panel above the graph allows editing the SPARQL
 * data provider settings at runtime.
 */
@Component({
  tag: 'onto-reactodia-graph',
  styleUrl: 'onto-reactodia-graph.scss',
})
export class OntoReactodiaGraph {
  /**
   * The active repository id. Bound as a plain HTML attribute and surfaced to
   * {@link queryFunction} as the request `url`; changing it re-points the graph at the new
   * repository (and resets the canvas), which is how runtime repository changes are handled.
   */
  @Prop() currentRepository: string;

  /**
   * HTTP transport for the SPARQL requests. A DOM property (not an attribute, since it is
   * a function) set by the host so requests go through the host's HTTP layer (auth,
   * interceptors) instead of a built-in `fetch`. Keeping it injectable preserves portability.
   */
  @Prop() queryFunction: SparqlQueryFunction;

  /**
   * UI language code (e.g. `en`, `fr`) for the Reactodia interface and the initial
   * graph-data labels. Defaults to English. Reactodia bakes the translation bundle into
   * the workspace when it is constructed and never re-reads it, so switching languages
   * requires rebuilding the React tree; the watcher below remounts on change.
   */
  @Prop() language = 'en';

  @State() private settingsOpen = false;

  /** Editable text per string setting; merged into real settings on Apply. */
  @State() private settingsText: Record<string, string> = stringSettings(defaultGraphDbSettings);

  /** The settings currently in effect on the data provider. */
  private providerSettings: SparqlDataProviderSettings = defaultGraphDbSettings;

  /** Dedicated mount point for the React tree, so it does not clash with Stencil's vdom. */
  private graphContainer: HTMLElement;

  private reactRoot: Root;

  @Watch('currentRepository')
  onInputChange(): void {
    this.renderGraph();
  }

  @Watch('language')
  onLanguageChange(): void {
    // The translation bundle is baked into the workspace at construction, so the only way
    // to re-translate the UI is to tear down the React tree and mount it afresh. Carry the
    // current diagram across the remount so switching languages does not wipe the canvas.
    const diagram = exportReactodiaLayout();
    this.renderGraph(diagram);
  }

  componentDidLoad(): void {
    this.renderGraph();
  }

  disconnectedCallback(): void {
    if (this.reactRoot) {
      unmountReactodia(this.reactRoot);
      this.reactRoot = undefined;
    }
  }

  render() {
    return (
      <Host>
        {/* The toggle button, the settings panel and the graph container are all kept in
            the DOM and switched via `hidden`, both so only one of the settings/graph shows
            at a time and so the React mount point is never moved by Stencil's diffing. */}
        <button type="button" class="provider-settings-button" hidden={this.settingsOpen} onClick={() => (this.settingsOpen = true)}>
          Provider settings
        </button>
        <div class="provider-settings" hidden={!this.settingsOpen}>
          <a
            href="https://reactodia.github.io/docs/api/workspace/interfaces/SparqlDataProviderSettings"
            target="_blank"
            rel="noopener noreferrer">
            SparqlDataProviderSettings documentation
          </a>
          <div class="provider-settings-fields">
            {Object.entries(stringSettings(defaultGraphDbSettings)).map(([key, defaultValue]) => (
              <div key={key}>
                <label>{key}</label>
                <button
                  type="button"
                  onClick={() => (this.settingsText = {...this.settingsText, [key]: defaultValue})}>
                  Reset to default
                </button>
                <textarea
                  rows={4}
                  spellcheck={false}
                  value={this.settingsText[key]}
                  onInput={(event) => (this.settingsText = {
                    ...this.settingsText,
                    [key]: (event.target as HTMLTextAreaElement).value,
                  })}></textarea>
              </div>
            ))}
          </div>
          <div class="provider-settings-actions">
            <button type="button" onClick={() => this.applySettings()}>Apply</button>
            <button type="button" onClick={() => this.cancelSettings()}>Cancel</button>
          </div>
        </div>
        <div class="reactodia-container" hidden={this.settingsOpen} ref={(el) => (this.graphContainer = el)}></div>
      </Host>
    );
  }

  /**
   * Merges the edited texts over the defaults and rebuilds the diagram with a fresh
   * data provider (the settings are bound at provider construction), resetting the canvas.
   * The data provider concatenates `defaultPrefix` directly with each query template, so
   * the trailing newline removed by the display trim has to be restored or the prefix
   * block and the query glue together on one line.
   */
  private applySettings(): void {
    this.providerSettings = {
      ...defaultGraphDbSettings,
      ...this.settingsText,
      defaultPrefix: `${this.settingsText.defaultPrefix}\n`,
    };
    this.settingsOpen = false;
    this.renderGraph();
  }

  /** Closes the panel, discarding edits by reverting to the settings currently in effect. */
  private cancelSettings(): void {
    this.settingsText = stringSettings(this.providerSettings);
    this.settingsOpen = false;
  }

  private renderGraph(initialDiagram?: SerializedDiagram): void {
    if (!this.currentRepository) {
      throw new Error('currentRepository is required');
    }

    if (!this.queryFunction) {
      throw new Error('queryFunction is required');
    }

    if (!this.graphContainer) {
      return;
    }

    const props = {
      currentRepository: this.currentRepository,
      queryFunction: this.queryFunction,
      language: this.language,
      initialDiagram,
      providerSettings: this.providerSettings,
    };

    if (this.reactRoot && !initialDiagram) {
      void updateReactodia(props);
    } else {
      this.reactRoot = mountReactodia(this.graphContainer, props);
    }
  }
}
