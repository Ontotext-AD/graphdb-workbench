import {Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit, signal} from '@angular/core';
import {defineCustomElements} from 'graphwise-reactodia/loader';
import {
  LanguageContextService,
  Rdf4jRestService,
  RepositoryContextService,
  service,
  SubscriptionList
} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger/logger-provider';

/**
 * The request descriptor Reactodia's `SparqlQueryFunction` passes to the transport. Declared
 * locally so the page does not depend on `@reactodia/workspace`; it mirrors that contract.
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
 * repository. This replaces the legacy AngularJS `reactodia-sparql-graph` directive: it keeps
 * `currentRepository`/`language` in sync and injects a `queryFunction` that routes Reactodia's
 * SPARQL requests through the workbench HTTP layer (auth interceptors included).
 */
@Component({
  selector: 'app-reactodia-page',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './reactodia-page.component.html',
  styleUrl: './reactodia-page.component.scss'
})
export class ReactodiaPageComponent implements OnInit, OnDestroy {
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly languageContextService = service(LanguageContextService);
  private readonly rdf4jRestService = service(Rdf4jRestService);
  private readonly logger = LoggerProvider.logger;

  private readonly subscriptions = new SubscriptionList();

  /** The active repository id; re-points (and resets) the diagram when it changes at runtime. */
  readonly currentRepository = signal('');

  /** UI language; read once on mount since Reactodia bakes the bundle in at construction. */
  readonly language = signal(this.languageContextService.getSelectedLanguage());

  /**
   * Transport for Reactodia's SPARQL requests. Reactodia chooses the `Accept` per query
   * (SPARQL-results JSON for SELECT lookups, RDF/Turtle for CONSTRUCT element info) and passes
   * it in `params.headers`; we forward it so GraphDB returns the matching format, then hand back
   * the raw `Response` which Reactodia expects.
   */
  readonly queryFunction = (params: SparqlQueryParams) =>
    this.rdf4jRestService
      .executeSparqlRequest(params.url, params.body ?? '', params.headers['Accept'])
      .then((response) => response.originalResponse)
      .catch((error) => this.logger.error('Failed to execute query', error));

  ngOnInit(): void {
    this.subscriptions.addAll([
      this.subscribeToRepositoryChanged(),
      this.subscribeToLanguageChanged()]
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribeAll();
  }

  private subscribeToLanguageChanged() {
    return this.languageContextService.onSelectedLanguageChanged((language) => {
      if (language) {
        this.language.set(language);
      }
    });
  }

  private subscribeToRepositoryChanged() {
    return this.repositoryContextService.onSelectedRepositoryChanged((repository) => {
      this.currentRepository.set(repository?.id || '');
    });
  }
}
