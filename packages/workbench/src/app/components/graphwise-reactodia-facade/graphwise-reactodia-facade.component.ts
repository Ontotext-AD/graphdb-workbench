import {Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, input} from '@angular/core';
import {translate} from '@jsverse/transloco';
import type {ErrorReport} from 'graphwise-reactodia';
import {defineCustomElements} from 'graphwise-reactodia/loader';
import {GraphExploreLink, Rdf4jRepositoryService, service, SparqlDataProviderSettings} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger/logger-provider';
import {NotificationProviderService} from '../../services/notification/notification-provider.service';

/**
 * The request descriptor graphwise-reactodia's `SparqlQueryFunction` passes to the transport.
 */
interface SparqlQueryParams {
  url: string;
  body?: string;
  headers: Record<string, string>;
  method: string;
  signal?: AbortSignal;
}

const ERROR_MESSAGES_PREFIX = 'graph_navigator.errors';

defineCustomElements();

/**
 * Hosts the graphwise-reactodia web component and wires it to the active
 * repository. It injects a `queryFunction` that routes graphwise-reactodia's SPARQL requests through the workbench HTTP layer (auth
 * interceptors included). The `currentRepository`/`language` it renders with are provided by the
 * page;
 */
@Component({
  selector: 'app-graphwise-reactodia-facade',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './graphwise-reactodia-facade.component.html',
  styleUrl: './graphwise-reactodia-facade.component.scss'
})
export class GraphwiseReactodiaFacadeComponent {
  private readonly rdf4jRepositoryService = service(Rdf4jRepositoryService);
  private readonly notificationProviderService = inject(NotificationProviderService);
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
   * The repository's graph-navigator query preset (graphwise-reactodia `SparqlDataProviderSettings`).
   */
  readonly providerSettings = input<SparqlDataProviderSettings>();

  /**
   * Transport for graphwise-reactodia's SPARQL requests. graphwise-reactodia chooses the `Accept` per query
   * (SPARQL-results JSON for SELECT lookups, RDF/Turtle for CONSTRUCT element info) and passes
   * it in `params.headers`
   */
  readonly queryFunction = (params: SparqlQueryParams) => this.executeRequest(params);

  readonly config = computed(() => ({
    queryFunction: this.queryFunction,
    seedIris: this.seedIris(),
    seedGraph: this.seedGraph()
  }));

  /**
   * Logs an error reported by graphwise-reactodia and shows a user-friendly message. If a translation does not exist,
   * a default message is shown.
   *
   * @param event - The `graphwiseReactodiaError` event.
   */
  onGraphwiseReactodiaError(event: Event): void {
    const {code, error} = (event as CustomEvent<ErrorReport>).detail;
    const messageKey = `${ERROR_MESSAGES_PREFIX}.${code.toLowerCase()}`;
    const translated = translate(messageKey);
    const message = translated !== messageKey ? translated : translate(`${ERROR_MESSAGES_PREFIX}.default`);
    this.logger.error(message, error);
    this.notificationProviderService.error(message);
  }

  /**
   * Sends one graphwise-reactodia request through the workbench HTTP layer. GDB requires the query to be
   * sent in the body of a POST request, but it is optional in the params, so reject, when we don't have a query.
   *
   * @param params - The request descriptor graphwise-reactodia supplied.
   * @returns A promise resolving to the raw response.
   */
  private async executeRequest(params: SparqlQueryParams): Promise<Response | undefined> {
    if (!params.body) {
      throw new Error(`Unsupported graphwise-reactodia ${params.method} request: the SPARQL query is missing`);
    }
    return this.rdf4jRepositoryService
      .executeSparqlRequest(params.url, params.body, params.headers['Accept'], params.signal);
  }
}
