import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {
  GraphExploreLink,
  GraphExploreService,
  LanguageContextService,
  RepositoryContextService,
  service,
  SubscriptionList
} from '@ontotext/workbench-api';
import {
  ReactodiaComponentFacadeComponent
} from '../../components/reactodia-component-facade/reactodia-component-facade.component';
import {PageLayoutComponent} from '../../components/page-layout/page-layout.component';
import {LoggerProvider} from '../../services/logger/logger-provider';

/**
 * Page that hosts the Reactodia graph. It owns the context subscriptions (repository and language),
 * gates between the "repository required" banner and the {@link ReactodiaComponentFacadeComponent}
 * (which owns the `graphwise-reactodia` web component and its wiring) based on the active
 * repository, and feeds the current repository/language down to the facade.
 */
@Component({
  selector: 'app-reactodia-page',
  standalone: true,
  templateUrl: './reactodia-page.component.html',
  imports: [
    ReactodiaComponentFacadeComponent,
    PageLayoutComponent,
  ],
  styleUrl: './reactodia-page.component.scss'
})
export class ReactodiaPageComponent implements OnInit, OnDestroy {
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly languageContextService = service(LanguageContextService);
  private readonly graphExploreService = service(GraphExploreService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly logger = LoggerProvider.logger;

  private readonly subscriptions = new SubscriptionList();

  readonly currentRepository = signal('');
  readonly language = signal(this.languageContextService.getSelectedLanguage());
  readonly seedIris = signal<string[]>([]);
  readonly seedGraph = signal<GraphExploreLink[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.initSubscriptions();
    this.initSeedFromQueryParams();
    this.initSeedGraphFromQueryParams();
  }

  private initSubscriptions() {
    this.subscriptions.addAll([
      this.subscribeToRepositoryChanged(),
      this.subscribeToLanguageChanged()
    ]);
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

  /**
   * Reads the `uri` (start resource) query param and forwards it as the seed for the diagram. When
   * no `uri` is provided (e.g. the page is opened directly), the diagram starts empty.
   */
  private initSeedFromQueryParams(): void {
    const uri = this.activatedRoute.snapshot.queryParams['uri'];
    this.seedIris.set(uri ? [uri] : []);
  }

  /**
   * Reads the `query` param (a SPARQL query, e.g. a CONSTRUCT sent from the SPARQL editor) together
   * with the `sameAs`/`inference` flags, computes its graph and forwards the resulting edges as the
   * `seedGraph` for the diagram. When no `query` is provided, the diagram is not seeded this way.
   */
  private initSeedGraphFromQueryParams(): void {
    this.loading.set(true);
    const queryParams = this.activatedRoute.snapshot.queryParams;
    const query = queryParams['query'];
    if (!query) {
      this.loading.set(false);
      return;
    }
    const inference = this.toOptionalBoolean(queryParams['inference']);
    const sameAs = this.toOptionalBoolean(queryParams['sameAs']);
    this.graphExploreService.loadGraphForQuery(query, inference, sameAs)
      .then((links) => this.seedGraph.set(links))
      .catch((error) => this.logger.error('Failed to load graph for query', error))
      .finally(() => this.loading.set(false));
  }

  /**
   * Parses a query-param flag. Query params arrive as strings, so a value is `true` only when it is
   * exactly `'true'`. A missing or empty value resolves to `undefined` so the caller can fall back to
   * its default rather than forcing the flag off.
   *
   * @param value - The raw query-param value.
   * @returns `true`/`false` for an explicit value, or `undefined` when the param is absent or empty.
   */
  private toOptionalBoolean(value: string | undefined): boolean | undefined {
    return value ? value === 'true' : undefined;
  }
}
