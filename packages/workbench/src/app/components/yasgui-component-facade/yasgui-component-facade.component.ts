import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  computed,
  input,
  output,
  effect,
  ViewEncapsulation,
  ElementRef,
  HostListener,
  signal,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {saveAs} from 'file-saver';
import {defineCustomElements} from 'ontotext-yasgui-web-component/loader';
import {OntotextYasguiConfig} from './models/yasgui/ontotext-yasgui-config';
import {SavedQueryConfig} from './models/query/saved-query-config';
import {QueryMode} from './models/query-mode';
import {QueryType} from './models/yasqe/query-type';
import {Yasgui} from './models/yasgui/yasgui';
import {translate, TranslocoService} from '@jsverse/transloco';
import {SaveQueryEvent} from './models/query/save-query-event';
import {SavedQueryParams} from '../../pages/sparql-editor/sparql-editor-query-params';
import {YasguiComponentUtil} from './yasgui-component-util';
import {EventDataType} from './models/event/event-data-type';
import {DownloadAsEvent} from './models/event/download-as-event';
import {NotificationMessageEvent} from './models/event/notification-message-event';
import {CountQueryRequestEvent} from './models/event/count-query-request-event';
import {OntotextYasguiEvent, YasguiOutputEvent} from './models/event/ontotext-yasgui-event';
import {CountQueryResponseEvent} from './models/event/count-query-response-event';
import {QueryRequestEvent} from './models/event/query-request-event';
import {QueryExecutedEvent} from './models/event/query-executed-event';
import {SaveQueryOpened} from './models/event/save-query-opened';
import {RequestAbortedEvent} from './models/event/request-aborted-event';
import {EventTypeMap, OutputHandlers} from './models/output-handlers';
import {
  SparqlService,
  service,
  OntoToastrService,
  SaveQueryRequest,
  Rdf4jRepositoryService,
  WindowService,
  AuthenticationStorageService,
  HttpHeaders,
  ObjectUtil,
  RepositoryContextService,
  LanguageService,
  LanguageContextService,
  HttpErrorResponse,
  TranslationBundle,
  AutocompleteService,
  MonitoringService,
  ThemeService,
  RuntimeConfigurationContextService, SubscriptionList,
  JsonldExportSettings,
} from '@ontotext/workbench-api';
import {YasguiComponent} from './models/yasgui-component';
import {FileUtils} from '../../utils/file-utils';
import {YasrPluginName} from './models/yasr/yasr-plugin-name';
import {DownloadAsModel} from '../../models/download/download-as-model';
import {mapAutocompleteSearchResultToYasguiModel} from './mappers/autocomplete-result-to-yasgui-model.mapper';
import {KeyboardShortcutConfiguration, KeyboardShortcutName} from './models/yasgui/keyboard-shortcut-configuration';
import {YasguiPersistenceMigrationService} from './service/yasgui-persistence-migration.service';
import {OntotextYasguiElement} from './models/ontotext-yasgui-element';
import {QueryChangedPayload} from './models/yasqe/query-changed-payload';
import {LoggerProvider} from '../../services/logger/logger-provider';
import {DownloadSettingsDialogComponent} from '../download-settings-dialog/download-settings-dialog.component';
import {DialogProviderService} from '../../services/dialog/dialog-provider.service';
import {DownloadSettingsDialogFooterComponent} from '../download-settings-dialog/footer/download-settings-dialog-footer/download-settings-dialog-footer.component';

defineCustomElements();

@Component({
  selector: 'app-yasgui-component-facade',
  standalone: true,
  // We need to disable encapsulation for the yasgui-component css overrides to be applied
  encapsulation: ViewEncapsulation.None,
  imports: [],
  templateUrl: './yasgui-component-facade.component.html',
  styleUrls: [
    './codemirror/moxer.css',
    './yasgui-component-facade.component.scss',
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: {
    '[class]': 'cssClass()'
  }
})
export class YasguiComponentFacadeComponent implements OnInit, OnDestroy {
  // ===================================
  // Angular injections
  // ===================================
  private readonly elementRef = inject(ElementRef);
  private readonly translocoService = inject(TranslocoService);
  private readonly yasguiPersistenceMigrationService = inject(YasguiPersistenceMigrationService);
  private readonly dialogProviderService = inject(DialogProviderService);

  // ===================================
  // API module injections
  // ===================================
  private readonly sparqlService = service(SparqlService);
  private readonly toastrService = service(OntoToastrService);
  private readonly rdf4jRepositoryService = service(Rdf4jRepositoryService);
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly authenticationStorageService = service(AuthenticationStorageService);
  private readonly languageContextService = service(LanguageContextService);
  private readonly languageService = service(LanguageService);
  private readonly autocompleteService = service(AutocompleteService);
  private readonly monitoringService = service(MonitoringService);
  private readonly themeService = service(ThemeService);
  private readonly runtimeConfigurationContextService = service(RuntimeConfigurationContextService);

  private readonly logger = LoggerProvider.logger;

  @HostListener('click', ['$event'])
  preventHashNavigation(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a[href="#"]');
    if (anchor) {
      event.preventDefault();
    }
  }

  // ===================================
  // Inputs
  // ===================================
  /**
   * YASGUI configuration object. This configuration is passed to the ontotext-yasgui component and allows to customize
   * its behavior and appearance.
   * The configuration can be partially provided, as the component will merge it with default values for the missing
   * properties.
   * For more details on the default values and the merging strategy, see the `config` computed property.
   */
  yasguiConfig = input<OntotextYasguiConfig>();

  /**
   * A callback function that is called after the initialization of the component is completed. This allows to perform
   * any additional setup or actions that depend on the component being fully initialized, such as executing a query or
   * loading saved queries.
   * The callback is called after the initial query state is set, which means that the yasqe editor is initialized with
   * the initial query value and the dirty checking handlers are added.
   * This ensures that any actions performed in the callback will have the correct initial state of the editor to work with.
   */
  afterInit = input<() => void>();

  /**
   * CSS class to be applied to the host element of the component. This allows to customize the styling of the component
   * by passing a CSS class from the parent component.
   */
  cssClass = input<string>('');

  /**
   * The configuration object that is used to configure the behavior and appearance of the ontotext-yasgui component.
   * This configuration is merged with default values and the resulting configuration is passed to the
   * ontotext-yasgui component.
   * The merging strategy is such that the provided configuration takes precedence over the default values, meaning that
   * if a property is provided in the input configuration, it will be used, otherwise the default value will be used.
   * This allows to provide only the necessary configuration properties and rely on sensible defaults for the rest.
   * The config is stored in a signal to allow for reactive updates to the configuration, so that if the input
   * configuration changes, the merged configuration will be updated and passed to the ontotext-yasgui component,
   * triggering any necessary updates in its behavior or appearance.
   */
  config = signal<OntotextYasguiConfig | undefined>(undefined);

  /**
   * The currently selected language in the application. This is used to set the language of the ontotext-yasgui
   * component and to update it when the selected language changes in the application.
   */
  language = signal<string | undefined>(this.languageContextService.getSelectedLanguage() || this.languageContextService.getDefaultLanguage());

  // ===================================
  // Outputs
  // ===================================

  /**
   * Emitted when the user changes the query in the editor.
   * The event payload contains the serialized query string and a dirty flag indicating whether the current query
   * differs from the initial query state.
   */
  readonly queryChanged = output<QueryChangedPayload>();

  constructor() {
    effect(() => {
      const yasguiConfig = this.yasguiConfig();
      if (!yasguiConfig) {
        return;
      }
      this.init(yasguiConfig);
    });
  }

  ngOnInit(): void {
    this.subscriptionList.addAll([
      this.runtimeConfigurationContextService.onThemeModeChanged(this.onThemeChanged.bind(this)),
      this.languageContextService.onSelectedLanguageChanged(this.onLanguageChange.bind(this), undefined, true),
    ]);
  }

  ngOnDestroy(): void {
    this.autocompleteAbortController?.abort();
    this.removeDirtyCheckHandlers();
    this.subscriptionList.unsubscribeAll();
  }

  // ===================================
  // Public variables
  // ===================================

  savedQueryConfig: SavedQueryConfig = {
    savedQueries: [],
    saveSuccess: false,
  };

  // ===================================
  // Private variables
  // ===================================

  private readonly subscriptionList = new SubscriptionList();

  /**
   * AbortController instance used for cancelling ongoing autocomplete requests when a new autocomplete request is made
   * before the previous one is completed.
   */
  private autocompleteAbortController?: AbortController;

  /**
   * The initial query value which is set in the yasqe editor. This is used for dirty checking while the user changes
   * the query.
   */
  private initialQueryValue?: string = undefined;

  /**
   * A computed property that returns the handlers for the different events emitted by the yasgui component via the
   * generic output event channel.
   * The handlers are defined in this component and are passed to the yasgui component via the config. This allows to
   * handle events emitted from the yasgui component in a centralized way.
   */
  private readonly outputHandlers = computed((): OutputHandlers => {
    const config = this.yasguiConfig();
    return {
      [EventDataType.QUERY]: this.queryHandler,
      [EventDataType.COUNT_QUERY]: this.countQueryRequestHandler,
      [EventDataType.COUNT_QUERY_RESPONSE]: this.countQueryResponseHandler,
      [EventDataType.DOWNLOAD_AS]: this.downloadAsHandler.bind(this),
      [EventDataType.NOTIFICATION_MESSAGE]: this.notificationMessageHandler.bind(this),
      ...config?.outputHandlers,
    };
  });

  private readonly downloadAsPluginNameToEventHandler = new Map<string, (event: DownloadAsEvent) => void>([
    [YasrPluginName.EXTENDED_RESPONSE, this.downloadCurrentResults.bind(this)],
    [YasrPluginName.EXTENDED_TABLE, this.downloadThroughServer.bind(this)],
  ]);

  // ===================================
  // Angular lifecycle hooks
  // ===================================

  // ===================================
  // Yasgui component event handlers
  // ===================================

  /**
   * Event handler that tries to load all saved queries and update the config of the yasgui component with them.
   */
  async loadSavedQueries() {
    try {
      const savedQueries = await this.sparqlService.getSavedQueries();
      // Recreate the config to trigger the watcher in the yasgui component that checks the identity only.
      this.savedQueryConfig = {
        ...this.savedQueryConfig,
        savedQueries: savedQueries.getItems()
      };
    } catch (err) {
      this.toastrService.error(
        err instanceof Error ? err.message : String(err),
        {title: this.translocoService.translate('sparql_editor.errors.saved_queries_load_failed'),}
      );
    }
  }

  /**
   * Handles the createSavedQuery event emitted by the ontotext-yasgui. The event is fired when a saved query should
   * be created.
   * @param event The event payload containing the query data from which a saved query object should be
   * created.
   */
  createSavedQuery(event: Event) {
    const payload = this.queryPayloadFromEvent(event as unknown as SaveQueryEvent);
    this.sparqlService.saveQuery(payload)
      .then(() => this.queryCreatedHandler(payload))
      .catch((err: HttpErrorResponse) => this.querySaveErrorHandler(err));
  }

  /**
   * Handles the updateSavedQuery event emitted by the ontotext-yasgui. The event is fired when a saved query should
   * be updated.
   * @param event The event payload containing the saved query data which should be updated.
   */
  updateSavedQuery(event: Event) {
    const saveQueryEvent = event as unknown as SaveQueryEvent;
    const payload = this.queryPayloadFromEvent(saveQueryEvent);
    this.sparqlService.updateQuery(saveQueryEvent.detail.originalQueryName!, payload)
      .then(() => this.queryUpdatedHandler(payload))
      .catch((err: HttpErrorResponse) => this.querySaveErrorHandler(err));
  }

  /**
   * Handles the deleteSavedQuery event emitted by the ontotext-yasgui. The event is fired when a saved query should
   * be deleted.
   * @param event The event payload containing the saved query data which should be deleted.
   */
  deleteSavedQuery(event: Event) {
    const payload = this.queryPayloadFromEvent(event as unknown as SaveQueryEvent);
    this.sparqlService.deleteQuery(payload.name)
      .then(() => {
        this.toastrService.success(this.translocoService.translate('sparql_editor.success.query_was_deleted', {savedQueryName: payload.name}));
      }).catch((err) => {
        this.toastrService.error(
          err instanceof Error ? err.message : String(err),
          {title: this.translocoService.translate(('sparql_editor.errors.query_delete_failed'))}
        );
      });
  }

  /**
   * Handles the shareQuery event emitted by the ontotext-yasgui. The event is fired when a query should be shared and
   * is expected the share link to be created.
   * @param event The event payload containing the query data from which the share link to be created.
   */
  shareQuery(event: Event) {
    const payload = this.queryPayloadFromEvent(event as unknown as SaveQueryEvent);
    this.savedQueryConfig = {
      ...this.savedQueryConfig,
      shareQueryLink: this.createShareQueryLink(payload),
    };
  }

  /**
   * Handles the shareSavedQuery event emitted by the ontotext-yasgui. The event is fired when a saved query should
   * be shared and is expected the share link to be created.
   * @param event The event payload containing the saved query data from which the share link to be created.
   */
  shareSavedQuery(event: Event) {
    const saveQueryEvent = event as unknown as SaveQueryEvent;
    this.savedQueryConfig = {
      ...this.savedQueryConfig,
      shareQueryLink: this.createShareSavedQueryLink(saveQueryEvent.detail.queryName, saveQueryEvent.detail.owner),
    };
  }

  /**
   * Handles the queryShareLinkCopied event emitted by the ontotext-yasgui. The event is fired when a query share link
   * is copied by the user.
   */
  queryShareLinkCopied() {
    this.toastrService.success(this.translocoService.translate('sparql_editor.success.url_was_copied'));
  }

  /**
   * Handles the saveQueryOpened event emitted by the ontotext-yasgui.
   * @param event The event payload containing the data of the saved query.
   */
  saveQueryOpened(event: Event) {
    const saveQueryOpenedEvent = this.toYasguiOutputModel(event) as SaveQueryOpened;
    YasguiComponentUtil.highlightTabName(saveQueryOpenedEvent.getTab());
  }

  /**
   * Handles the ontotext-yasgui component output events.
   *
   * @param event - the event fired from ontotext-yasgui component
   */
  output(event: Event) {
    const outputModel = this.toYasguiOutputModel(event);
    const handlers = this.outputHandlers();
    this.callOutputEventHandler(handlers, outputModel.type, outputModel);
  }

  // ===================================
  // Yasgui component output handlers for events emitted via the generic output channel.
  // ===================================

  /**
   * Calls the appropriate handler for the given event type if it exists in the provided handlers object.
   * @param handlers - the object containing the handlers for the different event types, where the key is the event type
   * and the value is the handler function.
   * @param type - the type of the event for which the handler should be called.
   * @param event - the event object that should be passed to the handler when called.
   */
  private callOutputEventHandler<K extends keyof OutputHandlers>(handlers: OutputHandlers, type: K, event: EventTypeMap[K]) {
    const handler = handlers[type];
    if (handler) {
      handler(event);
    }
  }

  /**
   * Handles the "query" event emitted by the ontotext-yasgui. The event is fired immediately before sending the
   * request and the request object can be altered here, and it will be sent with these changes.
   *
   * @param queryRequest - the event payload containing the query and the request object.
   */
  private readonly queryHandler = (queryRequest: QueryRequestEvent) => {
    const pageNumber = queryRequest.getPageNumber();
    const pageSize = queryRequest.getPageSize();
    if (pageSize && pageNumber) {
      queryRequest.setOffset((pageNumber - 1) * (pageSize - 1));
      queryRequest.setLimit(pageSize);
    }
    queryRequest.setPageNumber();
    queryRequest.setPageSize();
  };

  /**
   * Handles the "countQuery" event emitted by the ontotext-yasgui. The event is fired immediately before sending the
   * count query request and the request object can be altered here, and it will be sent with these changes.
   * @param countQueryRequest - the event payload containing the query and the request object.
   */
  private readonly countQueryRequestHandler = (countQueryRequest: CountQueryRequestEvent) => {
    countQueryRequest.setPageSize();
    countQueryRequest.setPageNumber();
    countQueryRequest.setCount(1);
  };

  /**
   * Handles the "countQueryResponse" event emitted by the ontotext-yasgui. The event is fired immediately after receiving the
   * count query response and the response have to be parsed if needed. As result of response parsing the body of the response have to
   * contain "totalElements".
   * @param countQueryResponseEvent - the event payload containing the response of count query.
   */
  private countQueryResponseHandler(countQueryResponseEvent: CountQueryResponseEvent){
    countQueryResponseEvent.setTotalElements();
  }

  /**
   * Handles {@link EventDataType.DOWNLOAD_AS} event emitted by "ontotext-yasgui-web-component".
   *
   * @param downloadAsEvent - the event payload containing the data related to the download as action, including the
   * plugin name and the data to be downloaded.
   * The handler for the specific plugin will be called if it exists in the `downloadAsPluginNameToEventHandler` map.
   */
  private downloadAsHandler(downloadAsEvent: DownloadAsEvent) {
    if (!downloadAsEvent.pluginName) {
      return;
    }
    const handler = this.downloadAsPluginNameToEventHandler.get(downloadAsEvent.pluginName);
    if (handler) {
      handler(downloadAsEvent);
    }
  }

  /**
   * Handles {@link EventDataType.NOTIFICATION_MESSAGE} event emitted by "ontotext-yasgui-web-component".
   * The event is fired when a message have to be shown to the user.
   *
   * @param notificationMessageEvent - the "ontotext-yasgui-web-component" event.
   */
  private readonly notificationMessageHandler = (notificationMessageEvent: NotificationMessageEvent) => {
    const { messageType, message } = notificationMessageEvent;
    if (!messageType || !message) {
      return;
    }
    switch (messageType) {
    case 'success':
      this.toastrService.success(message);
      break;
    case 'error':
      this.toastrService.error(message);
      break;
    case 'warning':
      this.toastrService.warning(message);
      break;
    case 'info':
      this.toastrService.info(message);
      break;
    }
  };

  // ===================================
  // Private methods
  // ===================================

  /**
   * Handles application theme changes by applying the corresponding editor theme to the Ontotext YASGUI component.
   */
  private onThemeChanged(){
    const ontotextYasguiComponent = this.getOntotextYasguiComponent();
    const themeName = this.themeService.getCodeEditorThemeName() || 'default';
    ontotextYasguiComponent.setTheme(themeName)
      .catch((error) => {
        this.logger.error(`Failed to apply the theme "${themeName}" to Sparql editor component.`, error);
      });
  }

  private onLanguageChange(newLang: string | undefined) {
    this.language.set(newLang ?? this.languageContextService.getDefaultLanguage());
  }

  private removeDirtyCheckHandlers(): void {
    this.getOntotextYasguiElements().forEach((el) => {
      el.removeEventListener('paste', this.delegatedPasteHandler);
      el.removeEventListener('keyup', this.delegatedKeyupHandler);
    });
  }

  private async init(yasguiConfig: OntotextYasguiConfig | undefined) {
    if (!yasguiConfig) {
      return;
    }

    const selectedRepository = this.repositoryContextService.getSelectedRepository();
    const isVirtualRepository = !!selectedRepository?.isOntop();
    // FIXME: This doesn't seem to do the same as in the legacy.
    const i18n = await this.getI18n();

    const runtimeConfig: Partial<OntotextYasguiConfig> = {
      isVirtualRepository,
      infer: isVirtualRepository || yasguiConfig.infer,
      immutableInfer: isVirtualRepository,
      sameAs: isVirtualRepository || yasguiConfig.sameAs,
      immutableSameAs: isVirtualRepository,
      yasqeAutocomplete: {
        LocalNamesAutocompleter: (term: string) => {
          this.autocompleteAbortController?.abort();
          this.autocompleteAbortController = new AbortController();
          return this.autocompleteLocalNames(term, this.autocompleteAbortController.signal);
        },
      },
      language: this.languageContextService.getSelectedLanguage(),
      i18n,
      // Called when update query is executed
      getRepositoryStatementsCount: () => this.getRepositoryStatementsCount(selectedRepository!.id),
      onQueryAborted: (req) => this.onQueryAborted(req),
    };

    if (runtimeConfig.showQueryButton !== undefined && !runtimeConfig.showQueryButton) {
      const keyboardShortcutConfiguration: KeyboardShortcutConfiguration = runtimeConfig.keyboardShortcutConfiguration || {};
      keyboardShortcutConfiguration[KeyboardShortcutName.EXECUTE_QUERY_OR_UPDATE] = false;
      keyboardShortcutConfiguration[KeyboardShortcutName.EXECUTE_EXPLAIN_PLAN_FOR_QUERY] = false;
      keyboardShortcutConfiguration[KeyboardShortcutName.EXECUTE_CHAT_GPT_EXPLAIN_PLAN_FOR_QUERY] = false;
      keyboardShortcutConfiguration[KeyboardShortcutName.CREATE_TAB] = false;
      keyboardShortcutConfiguration[KeyboardShortcutName.CREATE_SAVE_QUERY] = false;
      keyboardShortcutConfiguration[KeyboardShortcutName.SWITCH_NEXT_TAB] = false;
      keyboardShortcutConfiguration[KeyboardShortcutName.SWITCH_PREVIOUS_TAB] = false;
      keyboardShortcutConfiguration[KeyboardShortcutName.CLOSES_ALL_TABS] = false;
      runtimeConfig.keyboardShortcutConfiguration = keyboardShortcutConfiguration;
    } else {
      const keyboardShortcutConfiguration = runtimeConfig.keyboardShortcutConfiguration || {};
      keyboardShortcutConfiguration[KeyboardShortcutName.EXECUTE_EXPLAIN_PLAN_FOR_QUERY] = true;
      keyboardShortcutConfiguration[KeyboardShortcutName.EXECUTE_CHAT_GPT_EXPLAIN_PLAN_FOR_QUERY] = true;
      runtimeConfig.keyboardShortcutConfiguration = keyboardShortcutConfiguration;
    }

    // TODO: test this
    if (this.yasguiPersistenceMigrationService.isMigrationNeeded()) {
      this.yasguiPersistenceMigrationService.migrateYasguiPersistence(
        this.translocoService.translate('sparql_editor.yasgui.tabs.unnamed_tab_title')
      );
    }

    if (!runtimeConfig.themeName) {
      runtimeConfig.themeName = this.themeService.getCodeEditorThemeName();
    }

    const baseConfig = ObjectUtil.mergeWithDefaults(yasguiConfig, this.getDefaultConfig());
    const actualConfig = ObjectUtil.mergeWithDefaults(runtimeConfig as OntotextYasguiConfig, baseConfig);
    this.config.set(actualConfig);

    this.addDirtyCheckHandlers();

    this.setInitialQueryState().then(() => {
      this.afterInit()?.();
    });
  }

  private readonly setInitialQueryState = async () => {
    const query = await this.getOntotextYasguiComponent().getQuery();
    this.initialQueryValue = JSON.stringify(query);
  };

  private readonly addDirtyCheckHandlers = () => {
    const waitOntotextInitialized = setInterval(() => {
      const ontotextYasguiElements = this.getOntotextYasguiElements();
      if (ontotextYasguiElements.length > 0) {
        clearInterval(waitOntotextInitialized);

        ontotextYasguiElements.forEach((el) => {
          el.addEventListener('paste', this.delegatedPasteHandler);
          el.addEventListener('keyup', this.delegatedKeyupHandler);
        });
      }
    }, 100);
  };

  private readonly delegatedPasteHandler = (event: Event) => {
    if ((event.target as HTMLElement).closest('.CodeMirror')) {
      this.codeMirrorPasteHandler();
    }
  };

  private readonly delegatedKeyupHandler = (event: Event) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' && target.closest('.CodeMirror')) {
      this.codeMirrorKeyupHandler();
    }
  };

  private readonly codeMirrorKeyupHandler = () => {
    this.getOntotextYasguiComponent().getQuery()
      .then((query) => {
        this.emitQueryChanged(JSON.stringify(query));
      });
  };

  private readonly emitQueryChanged = (queryString: string) => {
    this.queryChanged.emit({
      query: queryString,
      dirty: this.initialQueryValue !== queryString
    });
  };

  private readonly codeMirrorPasteHandler = () => {
    let queryString: string;
    const ontotextYasguiElement = this.getOntotextYasguiComponent();
    ontotextYasguiElement.getQuery()
      .then((query) => {
        // cache the query string, it will be updated with the prefixes later in the chain
        queryString = query;
        return queryString;
      })
      .then((query: string) => this.sparqlService.addKnownPrefixes(query))
      .then((query: string) => {
        queryString = query;
        return ontotextYasguiElement.setQuery(queryString);
      })
      .then(() => {
        this.emitQueryChanged(JSON.stringify(queryString));
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.toastrService.error(
          errorMessage,
          {title: this.translocoService.translate('sparql_editor.errors.add_known_prefixes_failed')}
        );
      });
  };

  private async onQueryAborted(req: unknown): Promise<void> {
    if (req) {
      const request = req as { url: string; header: Record<string, string> };
      const repository = request.url.substring(request.url.lastIndexOf('/') + 1);
      const currentTrackAlias = request.header['X-GraphDB-Track-Alias'];
      await this.monitoringService.deleteQuery(currentTrackAlias, repository);
    }
  }

  private async autocompleteLocalNames(term: string, signal?: AbortSignal) {
    const data = await this.autocompleteService.search(term, signal);
    return mapAutocompleteSearchResultToYasguiModel(data);
  }

  private async getRepositoryStatementsCount(repositoryId: string) {
    try {
      return await this.rdf4jRepositoryService.getRepositorySize(repositoryId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.toastrService.error(
        this.translocoService.translate('sparql_editor.errors.get_repo_size_error', {repo: repositoryId, error: errorMessage}),
        {title: this.translocoService.translate('common.errors.server_error')}
      );
      throw error;
    }
  }

  private async getI18n(): Promise<Record<string, TranslationBundle>> {
    const supportedLanguages = this.languageService.getSupportedLanguages();

    const results = await Promise.allSettled(
      supportedLanguages.map(lang =>
        this.languageService.getLanguage(lang).then(bundle => ({ lang, bundle }))
      )
    );

    const i18n: Record<string, TranslationBundle> = {};
    for (const result of results) {
      if (result.status === 'fulfilled') {
        i18n[result.value.lang] = result.value.bundle;
      }
    }
    return i18n;
  }

  private getFileTimePrefix(): string {
    const lang = this.translocoService.getActiveLang();
    const now = new Date();
    return `${now.toLocaleDateString(lang)}_${now.toLocaleTimeString(lang)}`;
  }

  /**
   * Returns all ontotext-yasgui web component instances within this component's host element. There can be multiple
   * instances on a single page.
   * @returns NodeList of all ontotext-yasgui elements found within the host element.
   */
  private getOntotextYasguiElements(): NodeListOf<OntotextYasguiElement> {
    return this.elementRef.nativeElement.querySelectorAll('ontotext-yasgui');
  }

  /**
   * Getter for yasgui component.
   * @returns the instance of the YasguiComponent class which provides methods to interact with the underlying
   * ontotext-yasgui web component.
   */
  private getOntotextYasguiComponent(): YasguiComponent {
    return new YasguiComponent(this.getOntotextYasguiElements()[0]);
  }

  /**
   * Handles the download of the current query results in the format specified in the downloadAsEvent.
   * Depending on the content type specified in the event, it calls the appropriate method on the yasgui component
   * to get the results in the desired format and then triggers the file download using the FileUtils.
   *
   * This is applicable on the "Raw response" yasr plugin.
   *
   * @param downloadAsEvent - the event payload containing the content type in which the results should be downloaded.
   */
  private downloadCurrentResults(downloadAsEvent: DownloadAsEvent) {
    if ('application/sparql-results+json' === downloadAsEvent.contentType) {
      this.getOntotextYasguiComponent().getEmbeddedResultAsJson()
        .then((response) => {
          const content = JSON.stringify(response, null, '\t');
          FileUtils.downloadAsFile(`${this.getFileTimePrefix()}_queryResults.json`, downloadAsEvent.contentType!, content);
        });
    } else if ('text/csv' === downloadAsEvent.contentType) {
      this.getOntotextYasguiComponent().getEmbeddedResultAsCSV()
        .then((response) => {
          FileUtils.downloadAsFile(`${this.getFileTimePrefix()}_queryResults.csv`, downloadAsEvent.contentType!, response as string);
        });
    }
  }

  /**
   * Handles the download of the current query results through the server in the format specified in the downloadAsEvent.
   * @param downloadAsEvent - the event payload containing the content type in which the results should be downloaded
   * and other necessary data for the download.
   */
  private downloadThroughServer(downloadAsEvent: DownloadAsEvent) {
    const query = downloadAsEvent.query!;
    const infer = downloadAsEvent.infer!;
    const sameAs = downloadAsEvent.sameAs!;
    const accept = downloadAsEvent.contentType!;
    const authToken = this.authenticationStorageService.getAuthToken().getValue()!;

    if (downloadAsEvent.contentType === 'application/ld+json' || downloadAsEvent.contentType === 'application/x-ld+ndjson') {
      const format = downloadAsEvent.contentType === 'application/ld+json' ? 'json-ld' : 'ndjson-ld';

      this.dialogProviderService.open<unknown, JsonldExportSettings>(DownloadSettingsDialogComponent, {
        header: translate('components.dialog.download_settings.title.' + format),
        closable: true,
        footer: DownloadSettingsDialogFooterComponent,
        modalClass: 'modal-content'
      })
        .then((data) => {
          if (!data) {
            return;
          }
          const relValue = data.formName === 'framed' ? 'frame' : 'context';
          const acceptHeader = accept + ';profile=' + data.formLink;
          const linkHeader = data.link ? `<${data.link}>; rel="http://www.w3.org/ns/json-ld#${relValue}"` : '';
          this.downloadAs(query, infer, sameAs, authToken, acceptHeader, linkHeader);
        });
    } else {
      this.downloadAs(query, infer, sameAs, authToken, accept, '');
    }
  }

  private downloadAs(query: string, infer: boolean, sameAs: boolean, authToken:string, accept: string, link: string) {
    const queryParams = {query, infer, sameAs, authToken};
    const selectedRepository = this.repositoryContextService.getSelectedRepository()?.id;
    this.rdf4jRepositoryService.downloadResultsAsFile(selectedRepository!, queryParams, accept, link)
      .then(({data, filename}: DownloadAsModel) => {
        saveAs(data, filename);
      }).catch((error: HttpErrorResponse<Blob>) => {
        const errorBlob = error.data;
        if (errorBlob instanceof Blob) {
          errorBlob.text().then((message: string) => {
            if (error.status === 431) {
              this.toastrService.error(
                error.statusText,
                {title: this.translocoService.translate('common.errors.error')}
              );
            } else {
              this.toastrService.error(
                message,
                {title: this.translocoService.translate('common.errors.error')}
              );
            }
          });
        } else {
          this.toastrService.error(
            error.message ?? this.translocoService.translate('common.errors.error'),
            {title: this.translocoService.translate('common.errors.error')}
          );
        }
      });
  }

  private querySavedHandler(successMessage: string) {
    this.toastrService.success(successMessage);
    this.savedQueryConfig = {
      ...this.savedQueryConfig,
      saveSuccess: true
    };
  }

  private queryCreatedHandler(payload: SaveQueryRequest) {
    return this.querySavedHandler(this.translocoService.translate('sparql_editor.success.query_was_saved', {name: payload.name}));
  }

  private queryUpdatedHandler(payload: SaveQueryRequest) {
    return this.querySavedHandler(this.translocoService.translate('sparql_editor.success.query_was_updated', {name: payload.name}));
  }

  private querySaveErrorHandler(err: HttpErrorResponse) {
    const errorMessage = this.translocoService.translate('sparql_editor.errors.query_save_failed');
    this.toastrService.error(
      err instanceof HttpErrorResponse ? String(err.data) : String(err),
      {title: errorMessage}
    );
    this.savedQueryConfig = {
      ...this.savedQueryConfig,
      saveSuccess: false,
      errorMessage: [errorMessage],
    };
  }

  private queryPayloadFromEvent(event: SaveQueryEvent): SaveQueryRequest {
    return {
      name: event.detail.queryName,
      body: event.detail.query,
      shared: event.detail.isPublic
    };
  }

  private createShareSavedQueryLink(savedQueryName: string, owner?: string) {
    const url = new URL(WindowService.getLocationHref());
    url.searchParams.set(SavedQueryParams.name, savedQueryName);
    if (owner) {
      url.searchParams.set(SavedQueryParams.owner, owner);
    }
    return url.toString();
  }

  private createShareQueryLink(queryData: SaveQueryRequest) {
    const url = new URL(WindowService.getLocationHref());
    url.searchParams.set('name', queryData.name);
    url.searchParams.set('query', queryData.body);
    // TODO: pass these from the component as well,
    url.searchParams.set('infer', String(queryData.inference ?? true));
    url.searchParams.set('sameAs', String(queryData.sameAs ?? true));
    return url.toString();
  }

  private toYasguiOutputModel(event: Event): YasguiOutputEvent {
    const eventData = event as unknown as OntotextYasguiEvent;
    switch (eventData.detail.TYPE) {
    case EventDataType.DOWNLOAD_AS:
      return new DownloadAsEvent(eventData);
    case EventDataType.NOTIFICATION_MESSAGE:
      return new NotificationMessageEvent(eventData);
    case EventDataType.COUNT_QUERY:
      return new CountQueryRequestEvent(eventData);
    case EventDataType.COUNT_QUERY_RESPONSE:
      return new CountQueryResponseEvent(eventData);
    case EventDataType.QUERY:
      return new QueryRequestEvent(eventData);
    case EventDataType.QUERY_EXECUTED:
      return new QueryExecutedEvent(eventData);
    case EventDataType.SAVE_QUERY_OPENED:
      return new SaveQueryOpened(eventData);
    case EventDataType.REQUEST_ABORTED:
      return new RequestAbortedEvent(eventData);
    default: {
      // This branch should never be reached if EventDataType is exhaustive.
      // The cast to never forces a compile error if a new enum value is added without a matching case.
      const unhandled = eventData.detail.TYPE;
      throw new Error(`Unhandled yasgui event type: ${unhandled}`);
    }
    }
  }

  /**
   * Returns the default configuration for YASGUI.
   *
   * These defaults are used as fallback values when configuration does not explicitly provide them.
   *
   * @returns {Partial<OntotextYasguiConfig>} Default configuration object
   */
  private readonly getDefaultConfig = () => {
    return {
      componentId: 'yasgui-component',
      headers: this.getHeaders.bind(this),
      showEditorTabs: true,
      showToolbar: true,
      pageSize: 1000,
      maxPersistentResponseSize: 500000,
      showResultTabs: true,
    };
  };

  /**
   * Generates HTTP headers for executing a SPARQL query from YASGUI.
   *
   * @param yasgui - Active YASGUI instance
   * @returns Generated HTTP headers or undefined if no active tab exists
   */
  private getHeaders(yasgui: Yasgui) {
    const tab = yasgui.getTab();
    if (!tab) {
      return;
    }
    const yasqe = tab.getYasqe();
    const pageSize = yasqe.getPageSize();

    // Generates a new tracking alias for queries based on time
    const trackAlias = `yasgui-component-${performance.now()}-${Date.now()}`;

    const headers: HttpHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-GraphDB-Local-Consistency': 'updating',
      'X-GraphDB-Catch': `${pageSize}; throw`,
      'X-GraphDB-Track-Alias': trackAlias,
      'X-GraphDB-Repository-Location': this.repositoryContextService.getSelectedRepository()?.location || '',
      'X-Requested-With': 'XMLHttpRequest',
    };

    const authToken = this.authenticationStorageService.getAuthToken().getValue();
    if (authToken) {
      headers['Authorization'] = authToken;
    }

    const queryType = yasqe.getQueryType();
    if (QueryMode.UPDATE === yasqe.getQueryMode()) {
      headers['Accept'] = 'text/plain,/;q=0.9';
    } else if (QueryType.CONSTRUCT === queryType || QueryType.DESCRIBE === queryType) {
      headers['Accept'] = 'application/x-graphdb-table-results+json, application/rdf+json;q=0.9, */*;q=0.8';
    } else {
      headers['Accept'] = 'application/x-sparqlstar-results+json, application/sparql-results+json;q=0.9, */*;q=0.8';
    }
    return headers;
  }
}
