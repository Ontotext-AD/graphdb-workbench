import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {saveAs} from 'file-saver';
import {
  EventName,
  EventService,
  GraphExploreLink,
  GraphExploreService,
  GraphNavigatorService,
  GraphNavigatorSettings,
  LanguageContextService,
  OntoToastrService,
  RepositoryContextService,
  RuntimeConfigurationContextService,
  service,
  SubscriptionList,
  WindowService,
  ThemeMode
} from '@ontotext/workbench-api';
import {translate} from '@jsverse/transloco';
import {CLEAR_DIAGRAM_STORAGE_EVENT} from 'graphwise-reactodia';
import {
  GraphwiseReactodiaFacadeComponent
} from '../../components/graphwise-reactodia-facade/graphwise-reactodia-facade.component';
import {PageLayoutComponent} from '../../components/page-layout/page-layout.component';
import {LoggerProvider} from '../../services/logger/logger-provider';
import {GraphNavigatorSettingsComponent} from './graph-navigator-settings/graph-navigator-settings.component';
import {RestrictAccessDirective, ViewPermissions} from '../../directives/restrict-access.directive';
import {GraphNavigatorQueryParams} from '../../models/graph-navigator/graph-navigator-query-params';
import {ConfirmationProviderService} from '../../services/dialog/confirmation-provider.service';

/**
 * The query params that seed the canvas. They are removed from the URL when the repository is switched and
 * the diagram is cleared. All others are kept.
 */
const PARAMS_TO_REMOVE: string[] = [GraphNavigatorQueryParams.URI, GraphNavigatorQueryParams.QUERY];

/**
 * Page that hosts the Graph Navigator. It owns the context subscriptions (repository, language and
 * theme), gates between the "repository required" banner and the {@link GraphwiseReactodiaFacadeComponent}
 * (which owns the `graphwise-reactodia` web component and its wiring) based on the active
 * repository, and feeds the current repository/language/theme down to the facade.
 *
 * It also owns the repository's graph-navigator settings: the facade is rendered only once they are
 * loaded, so the diagram is always built with the settings of the active repository.
 */
@Component({
  selector: 'app-graph-navigator-page',
  standalone: true,
  templateUrl: './graph-navigator-page.component.html',
  imports: [
    GraphwiseReactodiaFacadeComponent,
    PageLayoutComponent,
    GraphNavigatorSettingsComponent,
    RestrictAccessDirective,
  ],
  styleUrl: './graph-navigator-page.component.scss'
})
export class GraphNavigatorPageComponent implements OnInit, OnDestroy {
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly languageContextService = service(LanguageContextService);
  private readonly graphExploreService = service(GraphExploreService);
  private readonly graphNavigatorService = service(GraphNavigatorService);
  private readonly toastrService = service(OntoToastrService);
  private readonly eventService = service(EventService);
  private readonly runtimeConfigurationContextService = service(RuntimeConfigurationContextService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly confirmationProviderService = inject(ConfirmationProviderService);
  private readonly router = inject(Router);
  private readonly logger = LoggerProvider.logger;

  private readonly subscriptions = new SubscriptionList();

  readonly currentRepository = signal<string | undefined>(undefined);
  readonly language = signal(this.languageContextService.getSelectedLanguage());
  readonly theme = signal<ThemeMode | undefined>(undefined);
  readonly seedIris = signal<string[]>([]);
  readonly seedGraph = signal<GraphExploreLink[]>([]);
  readonly loading = signal(false);
  readonly settings = signal<GraphNavigatorSettings | undefined>(undefined);
  protected readonly ViewPermissions = ViewPermissions;

  ngOnInit(): void {
    this.initSubscriptions();
    this.initSeedFromQueryParams();
    this.initSeedGraphFromQueryParams();
  }

  private initSubscriptions() {
    this.subscriptions.addAll([
      this.subscribeToRepositoryChanged(),
      this.subscribeToLanguageChanged(),
      this.subscribeToNavigationStart(),
      this.subscribeToThemeChanged()
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

  /**
   * Tells the `graphwise-reactodia` web component to drop its persisted diagram state whenever a
   * navigation to another view is made, so a stale diagram is not restored on the next visit to the page.
   */
  private subscribeToNavigationStart() {
    return this.eventService.subscribe(EventName.NAVIGATION_START, () => {
      WindowService.getWindow().dispatchEvent(new CustomEvent(CLEAR_DIAGRAM_STORAGE_EVENT));
    });
  }

  private subscribeToThemeChanged() {
    return this.runtimeConfigurationContextService.onThemeModeChanged((themeMode) => {
      if (themeMode) {
        this.theme.set(themeMode);
      }
    });
  }

  private subscribeToRepositoryChanged() {
    return this.repositoryContextService.onSelectedRepositoryChanged((repository) => {
      const repositoryId = repository?.id;
      if (this.currentRepository()) {
        this.clearDiagram();
      }
      // Clear the settings together with the repository change, so the facade is removed and mounted again
      // once, with the new repository and its settings together.
      this.settings.set(undefined);
      this.currentRepository.set(repositoryId);
      if (repositoryId) {
        this.loadSettings(repositoryId);
      }
    }, () => this.repositoryBeforeChangeHandler());
  }

  /**
   * Asks the user to confirm the repository switch, because it clears the diagram.
   *
   * @returns A Promise that resolves to `true` if the user confirmed, or `false` to cancel the switch.
   */
  private repositoryBeforeChangeHandler(): Promise<boolean> {
    if (!this.currentRepository()) {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      this.confirmationProviderService.confirm({
        header: translate('graph_navigator.confirmation.on_repository_change.title'),
        message: translate('graph_navigator.confirmation.on_repository_change.message'),
        acceptHandler: () => resolve(this.clearSeedQueryParams().then(() => true)),
        rejectHandler: () => resolve(false)
      });
    });
  }

  /**
   * Removes the query params in {@link PARAMS_TO_REMOVE} from the URL before the repository is switched, while
   * the URL still holds the current repository.
   *
   * @returns The Promise of the navigation. It resolves to `false` when there is nothing to remove, because
   * a navigation to the same URL is skipped.
   */
  private clearSeedQueryParams(): Promise<boolean> {
    const queryParams: Params = {...this.activatedRoute.snapshot.queryParams};
    PARAMS_TO_REMOVE.forEach((param) => delete queryParams[param]);
    return this.router.navigate([], {relativeTo: this.activatedRoute, queryParams, replaceUrl: true});
  }

  /**
   * Clears everything the diagram was started with (the seed and the persisted diagram state), so the next
   * repository opens with an empty canvas.
   */
  private clearDiagram(): void {
    this.seedIris.set([]);
    this.seedGraph.set([]);
    this.dispatchClearDiagramEvent();
  }

  /**
   * Uploads the settings file chosen in the settings controls and applies the settings the backend returns.
   */
  onUploadSettings(file: File, repositoryId: string): void {
    this.runSettingsRequest(
      this.graphNavigatorService.uploadSettings(repositoryId, file),
      'graph_navigator.settings.messages.upload_success',
      'graph_navigator.settings.messages.upload_failed'
    );
  }

  /**
   * Removes the repository's settings and applies the defaults the backend falls back to.
   */
  onResetSettings(repositoryId: string): void {
    this.runSettingsRequest(
      this.graphNavigatorService.deleteSettings(repositoryId).then(() => this.graphNavigatorService.getSettings(repositoryId)),
      'graph_navigator.settings.messages.reset_success',
      'graph_navigator.settings.messages.reset_failed'
    );
  }

  /**
   * Downloads the current settings as a Turtle file named after the repository, so they can be edited and
   * uploaded again.
   */
  onExportSettings(repositoryId: string): void {
    this.graphNavigatorService.exportSettings(repositoryId)
      .then((turtle) => saveAs(new Blob([turtle], {type: 'text/turtle'}), `graph-navigator-settings-${repositoryId}.ttl`))
      .catch((error) => {
        const message = translate('graph_navigator.settings.messages.export_failed');
        this.logger.error(message, error);
        this.toastrService.error(message);
      });
  }

  private runSettingsRequest(request: Promise<GraphNavigatorSettings>, successKey: string, failureKey: string): void {
    this.loading.set(true);
    request
      .then((settings) => {
        this.settings.set(settings);
        this.toastrService.success(translate(successKey));
      })
      .catch((error) => this.logAndToast(failureKey, error))
      .finally(() => this.loading.set(false));
  }

  /**
   * Shows and logs the translated message of a failed settings request.
   */
  private logAndToast(messageKey: string, error: unknown): void {
    const message = translate(messageKey);
    this.logger.error(message, error);
    this.toastrService.error(message);
  }

  private loadSettings(repositoryId: string): void {
    this.graphNavigatorService.getSettings(repositoryId)
      .then((settings) => {
        // Drop a late response for a repository that is no longer selected.
        if (repositoryId === this.currentRepository()) {
          this.settings.set(settings);
        }
      })
      .catch((error) => {
        if (repositoryId !== this.currentRepository()) {
          return;
        }
        this.logger.error('Failed to load the graph-navigator settings', error);
        this.toastrService.error(translate('graph_navigator.settings.messages.load_failed'));
      });
  }

  /**
   * Reads the `uri` (start resource) query param and forwards it as the seed for the diagram. When
   * no `uri` is provided (e.g. the page is opened directly), the diagram starts empty.
   */
  private initSeedFromQueryParams(): void {
    const uri = this.activatedRoute.snapshot.queryParams[GraphNavigatorQueryParams.URI];
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
    const query = queryParams[GraphNavigatorQueryParams.QUERY];
    if (!query) {
      this.loading.set(false);
      return;
    }
    const inference = this.toOptionalBoolean(queryParams[GraphNavigatorQueryParams.INFERENCE]);
    const sameAs = this.toOptionalBoolean(queryParams[GraphNavigatorQueryParams.SAME_AS]);
    this.graphExploreService.loadGraphForQuery(query, inference, sameAs)
      .then((links) => this.seedGraph.set(links))
      .catch((error) => {
        this.logger.error('Failed to load graph for query', error);
        this.toastrService.error(translate('graph_navigator.errors.graph_load_failed'));
      })
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
  private toOptionalBoolean(value?: string): boolean | undefined {
    return value ? value === 'true' : undefined;
  }

  private dispatchClearDiagramEvent() {
    WindowService.getWindow().dispatchEvent(new CustomEvent(CLEAR_DIAGRAM_STORAGE_EVENT));
  }
}
