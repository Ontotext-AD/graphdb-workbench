import {Component, computed, CUSTOM_ELEMENTS_SCHEMA, input} from '@angular/core';
import {defineCustomElements} from 'graphwise-reactodia/loader';
import {Rdf4jRepositoryService, service} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger/logger-provider';

/**
 * The request descriptor Reactodia's `SparqlQueryFunction` passes to the transport. Declared
 * locally so the facade does not depend on `@reactodia/workspace`; it mirrors that contract.
 */
interface SparqlQueryParams {
  url: string;
  body: string;
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
  private readonly logger = LoggerProvider.logger;

  /** The active repository id; re-points (and resets) the diagram when it changes at runtime. */
  readonly currentRepository = input.required<string>();
  /** The selected UI language passed to the web component. */
  readonly language = input<string>();
  /** The resource IRIs the diagram starts from (Reactodia's `seed`). */
  readonly seedIris = input<string[]>([]);

  /**
   * Transport for Reactodia's SPARQL requests. Reactodia chooses the `Accept` per query
   * (SPARQL-results JSON for SELECT lookups, RDF/Turtle for CONSTRUCT element info) and passes
   * it in `params.headers`; we forward it so GraphDB returns the matching format, then hand back
   * the raw `Response` which Reactodia expects.
   */
  readonly queryFunction = (params: SparqlQueryParams) =>
    this.rdf4jRepositoryService
      .executeSparqlRequest(params.url, params.body ?? '', params.headers['Accept'])
      .catch((error) => this.logger.error('Failed to execute query', error));

  readonly config = computed(() => ({
    queryFunction: this.queryFunction,
    seedIris: this.seedIris()
  }));
}
