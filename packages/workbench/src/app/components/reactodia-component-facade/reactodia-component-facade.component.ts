import {Component, computed, CUSTOM_ELEMENTS_SCHEMA, input} from '@angular/core';
import {translate} from '@jsverse/transloco';
import {defineCustomElements} from 'graphwise-reactodia/loader';
import {GraphExploreLink, OntoToastrService, Rdf4jRepositoryService, service} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger/logger-provider';

/**
 * The request descriptor Reactodia's `SparqlQueryFunction` passes to the transport. Declared
 * locally so the facade does not depend on `@reactodia/workspace`; it mirrors that contract.
 */
interface SparqlQueryParams {
  url: string;
  body?: string;
  headers: Record<string, string>;
  method: string;
  signal?: AbortSignal;
}

defineCustomElements();

/**
 * Hosts the Reactodia graph (`graphwise-reactodia`) web component and wires it to the active
 * repository. This replaces the legacy AngularJS `reactodia-sparql-graph` directive: it injects a
 * `queryFunction` that routes Reactodia's SPARQL requests through the workbench HTTP layer (auth
 * interceptors included). The `currentRepository`/`language` it renders with are provided by the
 * page; this component holds no context subscriptions of its own.
 */
@Component({
  selector: 'app-reactodia-component-facade',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './reactodia-component-facade.component.html',
  styleUrl: './reactodia-component-facade.component.scss'
})
export class ReactodiaComponentFacadeComponent {
  private readonly rdf4jRepositoryService = service(Rdf4jRepositoryService);
  private readonly ontoToastrService = service(OntoToastrService);
  private readonly logger = LoggerProvider.logger;

  /** The active repository id; re-points (and resets) the diagram when it changes at runtime. */
  readonly currentRepository = input.required<string>();
  /** The selected UI language passed to the web component. */
  readonly language = input<string>();
  /** The applied theme passed to the web component. */
  readonly theme = input<string>();
  /** The resource IRIs to seed the diagram with */
  readonly seedIris = input<string[]>([]);
  /**
   * Pre-resolved graph to place on the canvas. Used for query-driven
   * graphs (e.g. CONSTRUCT results) whose links are not persisted in the repository and therefore
   * cannot be resolved lazily from the SPARQL endpoint.
   */
  readonly seedGraph = input<GraphExploreLink[]>([]);

  /**
   * Transport for Reactodia's SPARQL requests. Reactodia chooses the `Accept` per query
   * (SPARQL-results JSON for SELECT lookups, RDF/Turtle for CONSTRUCT element info) and passes
   * it in `params.headers`; we forward it so GraphDB returns the matching format, then hand back
   * the raw `Response` which Reactodia expects.
   */
  readonly queryFunction = (params: SparqlQueryParams) =>
    this.executeRequest(params)
      .catch((error) => {
        // An aborted request is a cancellation Reactodia asked for so don't show toast
        if (error?.name !== 'AbortError') {
          this.logger.error('Failed to execute query', error);
          this.ontoToastrService.error(translate('reactodia.errors.query_execution_failed'));
        }
        throw error;
      });

  readonly config = computed(() => ({
    queryFunction: this.queryFunction,
    seedIris: this.seedIris(),
    seedGraph: this.seedGraph()
  }));

  /**
   * Sends one Reactodia request through the workbench HTTP layer. GDB requires the query to be
   * sent in the body of a POST request, but it is optional in the params, so reject, when we don't have a query.
   *
   * @param params - The request descriptor Reactodia supplied.
   * @returns A promise resolving to the raw response.
   */
  private async executeRequest(params: SparqlQueryParams): Promise<Response | undefined> {
    if (!params.body) {
      throw new Error(`Unsupported Reactodia ${params.method} request: the SPARQL query is missing`);
    }
    return this.rdf4jRepositoryService
      .executeSparqlRequest(params.url, params.body, params.headers['Accept'], params.signal);
  }
}
