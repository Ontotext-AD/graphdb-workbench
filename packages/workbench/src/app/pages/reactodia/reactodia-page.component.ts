import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {
  LanguageContextService,
  RepositoryContextService,
  service,
  SubscriptionList
} from '@ontotext/workbench-api';
import {
  ReactodiaComponentFacadeComponent
} from '../../components/reactodia-component-facade/reactodia-component-facade.component';
import {PageLayoutComponent} from '../../components/page-layout/page-layout.component';

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
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly subscriptions = new SubscriptionList();

  readonly currentRepository = signal('');
  readonly language = signal(this.languageContextService.getSelectedLanguage());
  readonly seedIris = signal<string[]>([]);

  ngOnInit(): void {
    this.initSubscriptions();
    this.initSeedFromQueryParams();
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
}
