import {Component, h, Host, Prop, Watch, Element} from '@stencil/core';
import {Root} from 'react-dom/client';
import {SparqlQueryFunction, SerializedDiagram} from '@reactodia/workspace';
import {exportReactodiaLayout, mountReactodia, unmountReactodia, updateReactodia} from './reactodia-app';

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
 * dependency.
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

  @Element() private readonly hostElement: HTMLElement;

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
      <Host></Host>
    );
  }

  private renderGraph(initialDiagram?: SerializedDiagram): void {
    if (!this.currentRepository) {
      throw new Error('currentRepository is required');
    }

    if (!this.queryFunction) {
      throw new Error('queryFunction is required');
    }

    if (!this.hostElement) {
      return;
    }

    const props = {
      currentRepository: this.currentRepository,
      queryFunction: this.queryFunction,
      language: this.language,
      initialDiagram,
    };

    if (this.reactRoot && !initialDiagram) {
      void updateReactodia(props);
    } else {
      this.reactRoot = mountReactodia(this.hostElement, props);
    }
  }
}
