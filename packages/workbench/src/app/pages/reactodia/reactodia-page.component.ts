import {Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit, signal} from '@angular/core';
import {
  LanguageContextService,
  Rdf4jRestService,
  RepositoryContextService,
  service,
  SubscriptionList,
} from '@ontotext/workbench-api';

/**
 * The request descriptor Reactodia's `SparqlQueryFunction` passes to the transport. Declared
 * locally so the page does not depend on `@reactodia/workspace`; it mirrors that contract.
 */
interface SparqlQueryParams {
  url: string;
  body?: string;
  headers: Record<string, string>;
  method: string;
  signal?: AbortSignal;
}

/**
 * Hosts the Reactodia graph (`onto-reactodia-graph`) web component and wires it to the active
 * repository. This replaces the legacy AngularJS `reactodia-sparql-graph` directive: it keeps
 * `currentRepository`/`language` in sync and injects a `queryFunction` that routes Reactodia's
 * SPARQL requests through the workbench HTTP layer (auth interceptors included).
 */
@Component({
  selector: 'app-reactodia-page',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './reactodia-page.component.html',
  styleUrl: './reactodia-page.component.scss',
})
export class ReactodiaPageComponent implements OnInit, OnDestroy {
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly languageContextService = service(LanguageContextService);
  private readonly rdf4jRestService = service(Rdf4jRestService);

  private readonly subscriptions = new SubscriptionList();

  /** The active repository id; re-points (and resets) the diagram when it changes at runtime. */
  readonly currentRepository = signal('');

  /** UI language; read once on mount since Reactodia bakes the bundle in at construction. */
  readonly language = signal(this.languageContextService.getSelectedLanguage());

  /**
   * Transport for Reactodia's SPARQL requests. Reactodia chooses the `Accept` per query
   * (SPARQL-results JSON for SELECT lookups, RDF/Turtle for CONSTRUCT element info) and passes
   * it in `params.headers`; we forward it so GraphDB returns the matching format, then hand back
   * the raw fetch `Response` Reactodia expects (including on error, so it sees `ok === false`).
   */
  readonly queryFunction = (params: SparqlQueryParams): Promise<Response> =>
    this.rdf4jRestService
      .executeSparqlRequest(params.url, params.body ?? '', {accept: params.headers['Accept']})
      .then(
        (response) => response.originalResponse,
        (error) => (error?.originalResponse ? error.originalResponse : Promise.reject(error)),
      );

  ngOnInit(): void {
    this.currentRepository.set(this.repositoryContextService.getSelectedRepository()?.id ?? '');
    this.subscriptions.addAll([
      this.repositoryContextService.onSelectedRepositoryChanged((repository) => {
        if (repository) {
          this.currentRepository.set(repository.id);
        }
      }),
      this.languageContextService.onSelectedLanguageChanged((language) => {
        if (language) {
          this.language.set(language);
        }
      })]
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribeAll();
  }
}
