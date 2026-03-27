import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {MessageModule} from 'primeng/message';
import {TranslocoPipe, TranslocoService} from '@jsverse/transloco';
import {PageLayoutComponent} from '../../components/page-layout/page-layout.component';
import {PageInfoTooltipComponent} from '../../components/page-info-tooltip/page-info-tooltip.component';
import {
  YasguiComponentFacadeComponent
} from '../../components/yasgui-component-facade/yasgui-component-facade.component';
import {OntotextYasguiConfig} from '../../components/yasgui-component-facade/models/yasgui/ontotext-yasgui-config';
import {LoggerProvider} from '../../services/logger-provider';
import {QueryExecutedEvent} from '../../components/yasgui-component-facade/models/event/query-executed-event';
import {RequestAbortedEvent} from '../../components/yasgui-component-facade/models/event/request-aborted-event';
import {QueryMode} from '../../components/yasgui-component-facade/models/query-mode';
import {VIEW_SPARQL_EDITOR} from '../../components/yasgui-component-facade/models/constants';
import {Yasgui} from '../../components/yasgui-component-facade/models/yasgui/yasgui';
import {
  AuthenticatedUser,
  BeforeUpdateQueryResult,
  ConnectorsService,
  EventName,
  EventService,
  LanguageContextService,
  MonitoringService,
  NamespaceMap,
  NamespacesService,
  navigateTo,
  NavigationStartPayload,
  OntoToastrService,
  ParentWindowMessageService,
  Rdf4jRepositoryService,
  REPOSITORY_ID_PARAM,
  RepositoryContextService,
  RepositoryReference,
  RepositoryStorageService,
  SavedQuery,
  SecurityContextService,
  service,
  SparqlService,
  SparqlStorageService,
  SubscriptionList,
  WindowService,
} from '@ontotext/workbench-api';
import {EventDataType} from '../../components/yasgui-component-facade/models/event/event-data-type';
import {YasrToolbarPlugin} from '../../components/yasgui-component-facade/models/yasr/yasr-toolbar-plugin';
import {Yasr} from '../../components/yasgui-component-facade/models/yasr/yasr';
import {QueryType} from '../../components/yasgui-component-facade/models/yasqe/query-type';
import {SavedQueryParams, SharedQueryParams, YasguiQueryParams} from './sparql-editor-query-params';
import {YasguiComponentUtil} from '../../components/yasgui-component-facade/yasgui-component-util';
import {YasguiComponent} from '../../components/yasgui-component-facade/models/yasgui-component';
import {ConnectorCommand} from '../../models/connectors/connector-command';
import {mapSavedQueryToTabQueryModel} from './mappers/saved-query-to-tab-query-model.mapper';
import {OngoingRequestsInfo} from '../../components/yasgui-component-facade/models/ongoing-requests-info';
import {CancelAbortingQuery} from './error/cancel-abort-query';
import {ConfirmationService} from 'primeng/api';
import {YasguiOperation, YasguiOperationType} from './constants';
import {
  GeoPluginFeatureClickEvent
} from '../../components/yasgui-component-facade/models/event/geo-plugin-feature-click-event';

@Component({
  selector: 'app-sparql-editor-page',
  standalone: true,
  imports: [
    TranslocoPipe,
    MessageModule,
    PageLayoutComponent,
    PageInfoTooltipComponent,
    YasguiComponentFacadeComponent,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './sparql-editor-page.component.html',
  styleUrl: './sparql-editor-page.component.scss',
})
export class SparqlEditorPageComponent implements OnInit, OnDestroy {
  private readonly logger = LoggerProvider.logger;

  // ================================
  // Angular DI
  // ================================
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly translocoService = inject(TranslocoService);
  private readonly confirmationService = inject(ConfirmationService);

  // ================================
  // API DI
  // ================================
  private readonly rdfRepositoryService = service(Rdf4jRepositoryService);
  private readonly repositoryStorageService = service(RepositoryStorageService);
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly namespacesService = service(NamespacesService);
  private readonly sparqlService = service(SparqlService);
  private readonly connectorsService = service(ConnectorsService);
  private readonly ontoToastrService = service(OntoToastrService);
  private readonly sparqlStorageService = service(SparqlStorageService);
  private readonly parentWindowMessageService = service(ParentWindowMessageService);
  private readonly languageContextService = service(LanguageContextService);
  private readonly monitoringService = service(MonitoringService);
  private readonly eventService = service(EventService);

  // ================================
  // Private variables
  // ================================
  private readonly QUERY_EDITOR_ID = '#query-editor';
  private readonly subscriptions = new SubscriptionList();
  private isOntopRepo = this.repositoryContextService.isActiveRepoOntopType();
  private inferUserSetting = false;
  private sameAsUserSetting = false;
  private prefixes?: NamespaceMap;
  private readonly exploreVisualGraphYasrToolbarElementBuilder: YasrToolbarPlugin = {
    createElement: (yasr: Yasr) => {
      const buttonName = document.createElement('span');
      buttonName.classList.add('explore-visual-graph-button-name');
      const exploreVisualButtonWrapperElement = document.createElement('button');
      exploreVisualButtonWrapperElement.classList.add('explore-visual-graph-button', 'icon-data');
      exploreVisualButtonWrapperElement.onclick = ()=> {
        const paramsToParse = {
          query: yasr.yasqe.getValue(),
          sameAs: yasr.yasqe.getSameAs(),
          inference: yasr.yasqe.getInfer(),
        };
        void this.router.navigate(['graphs-visualizations'], {
          queryParams: paramsToParse
        });
      };
      exploreVisualButtonWrapperElement.appendChild(buttonName);
      return exploreVisualButtonWrapperElement;
    },
    updateElement: (element: HTMLElement, yasr: Yasr) => {
      element.classList.add('hidden');
      if (!yasr.hasResults()) {
        return;
      }
      const queryType = yasr.yasqe.getQueryType();
      if (QueryType.CONSTRUCT === queryType || QueryType.DESCRIBE === queryType) {
        element.classList.remove('hidden');
      }
      element.querySelector<HTMLElement>('.explore-visual-graph-button-name')!.innerText =
        this.translocoService.translate('sparql_editor.yasgui.toolbar.visual_graph_btn');
    },
    getOrder: () => {
      return 2;
    },
    destroy() {
      // No special cleanup is needed for this button, but the method must be implemented as part of the
      // YasrToolbarPlugin interface
    }
  };
  private readonly tabIdToConnectorProgressModalMapping = new Map();
  private internallyReloaded = false;
  private queriesAreCanceled = false;
  // This is used to determine whether the view is embedded in another application. When embedded, we want to hide
  // some elements and disable the "go to home" functionality, as it doesn't make sense in that context.
  private embedded = false;
  // This is used to determine the specific action that the external application wants to perform, for example,
  // when a feature is clicked in the Geo plugin and YASGUI is embedded in the external application, the external
  // application might want to handle the click in a specific way.
  // Possible operation types are defined in YasguiOperationType.
  private yasguiOperation: string | undefined = undefined;
  private readonly boundBeforeunloadHandler = () => this.beforeunloadHandler();

  // ================================
  // Public variables
  // ================================
  yasguiConfig = signal<OntotextYasguiConfig | undefined>(undefined);
  activeRepositoryReference: RepositoryReference | undefined;
  // savedQueryConfig = undefined;

  ngOnInit(): void {
    this.subscribeHandlers();
    window.addEventListener('beforeunload', this.boundBeforeunloadHandler);
  }

  private subscribeHandlers() {
    this.subscriptions.addAll([
      this.repositoryContextService.onSelectedRepositoryChanged((repositoryReference) => this.repositoryChangedHandler(repositoryReference)),
      this.languageContextService.onSelectedLanguageChanged(() => this.onLanguageChange(), undefined, true),
      this.eventService.subscribe(EventName.NAVIGATION_START, (eventPayload: NavigationStartPayload) => this.locationChangeHandler(eventPayload)),
    ]);
  }

  private onLanguageChange() {
    this.confirmationService.confirm({
      message: this.translocoService.translate('sparql_editor.confirmation.on_language_change.message'),
      header: this.translocoService.translate('sparql_editor.confirmation.on_language_change.title'),
      acceptButtonProps: {
        label: this.translocoService.translate('components.dialog.confirmation.confirm_btn'),
        severity: 'primary',
      },
      rejectButtonProps: {
        label: this.translocoService.translate('components.dialog.confirmation.cancel_btn'),
        severity: 'secondary',
      },
      accept: () => {
        // The page needs to be reloaded, because of the Google charts and Pivot table scripts. When the language is
        // changed, the correct language for these components is loaded only on the page reload, but we can't be sure
        // that the user will reload the page by themselves, so we need to do it programmatically. We can't just change
        // the src of the existing script, because these components don't react to it, so we need to reload the whole page.
        WindowService.reloadPage();
      },
    });
  }

  /**
   * Updates the Yasgui configuration
   */
  private updateConfig(clearYasguiState: boolean) {
    const config = new OntotextYasguiConfig();
    config.componentId = VIEW_SPARQL_EDITOR;
    config.endpoint = this.getEndpoint.bind(this);
    config.prefixes = this.prefixes?.namespaces;
    config.infer = this.isOntopRepo || this.inferUserSetting;
    config.sameAs = this.isOntopRepo || this.sameAsUserSetting;
    config.yasrToolbarPlugins = [this.exploreVisualGraphYasrToolbarElementBuilder];
    config.beforeUpdateQuery = (query: string, tabId: string) => this.getBeforeUpdateQueryHandler(query, tabId);
    config.outputHandlers = new Map([
      [EventDataType.QUERY_EXECUTED, (eventData: unknown) => this.queryExecutedHandler(eventData as QueryExecutedEvent)],
      [EventDataType.REQUEST_ABORTED, (eventData: unknown) => this.requestAbortedHandler(eventData as RequestAbortedEvent)],
    ]);
    config.clearState = clearYasguiState;

    if (this.embedded && this.yasguiOperation === YasguiOperation.EXTERNAL_CLICK_HANDLER) {
      config.pluginsConfigurations = {
        geo: {
          onFeatureClick: (event: GeoPluginFeatureClickEvent) => this.onFeatureClickHandler(event),
        },
      };
    }

    this.yasguiConfig.set(config);
  }

  /**
   * Initializes the editor from the URL parameters.
   * @param clearYasguiState if set to true, the Yasgui will reinitialize and clear all tab results. Queries will remain.
   */
  private initViewFromUrlParams(clearYasguiState = false) {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    if (queryParams.hasOwnProperty(YasguiQueryParams.EMBEDDED)) {
      this.embedded = true;
    }
    if (queryParams.hasOwnProperty(YasguiQueryParams.YASGUI_OPERATION)) {
      this.yasguiOperation = queryParams[YasguiQueryParams.YASGUI_OPERATION];
    }
    this.updateConfig(clearYasguiState);
    if (queryParams.hasOwnProperty(SavedQueryParams.name)) {
      // init new tab from shared saved query link
      this.initTabFromSavedQuery(queryParams);
    } else if (queryParams.hasOwnProperty(SharedQueryParams.query)) {
      // init new tab from shared query link
      this.initTabFromSharedQuery(queryParams);
    }
    // TODO: uncomment when GuidesService is available in the api module
    // else if (GuidesService.isActive()) {
    // openNewTab();
    // }
  }

  private initTabFromSavedQuery(queryParams: Params) {
    const savedQueryName = queryParams[SavedQueryParams.name];
    const savedQueryOwner = queryParams[SavedQueryParams.owner];
    const isExecuteRequested = queryParams[YasguiQueryParams.EXECUTE] === 'true';
    this.sparqlService.getSavedQuery(savedQueryName, savedQueryOwner)
      .then((savedQueryList) => {
        const savedQuery = savedQueryList.getFirstQuery();
        return this.openNewTab(savedQuery);
      })
      .then(() => this.clearUrlParameters())
      .then(() => this.autoExecuteQueryIfRequested(isExecuteRequested))
      .catch((err) => {
        this.ontoToastrService.error(
          this.translocoService.translate('sparql_editor.errors.saved_query_load_failed', {
            savedQueryName: savedQueryName,
            error: err instanceof Error ? err.message : String(err),
          })
        );
      });
  }

  private initTabFromSharedQuery(queryParams: Params) {
    const queryName = queryParams[SharedQueryParams.name];
    const query = queryParams[SharedQueryParams.query];
    const queryOwner = queryParams[SharedQueryParams.owner];
    const isExecuteRequested = queryParams[SharedQueryParams.execute] === 'true';
    const sharedQueryModel = new SavedQuery({
      queryName: queryName,
      query: query,
      owner: queryOwner,
      isPublic: true,
      readonly: true,
    });
    this.openNewTab(sharedQueryModel)
      .then(() => this.clearUrlParameters())
      .then(() => this.autoExecuteQueryIfRequested(isExecuteRequested))
      .catch((err) => {
        this.ontoToastrService.error(
          this.translocoService.translate('sparql_editor.errors.shared_query_load_failed', {
            sharedQueryName: queryName,
            error: err instanceof Error ? err.message : String(err),
          })
        );
      });
  };

  /**
   * Callback function triggered when a user clicks on a feature in the geo plugin.
   * Sends a message to the parent window using `ParentWindowMessageService`.
   * @param featurePayload - the payload containing information about the clicked feature, such as its properties and geometry.
   */
  private onFeatureClickHandler(featurePayload: GeoPluginFeatureClickEvent) {
    this.parentWindowMessageService.postMessage({
      type: YasguiOperationType.FEATURE_CLICK,
      featurePayload,
    }, WindowService.getReferer());
  }

  /**
   * Opens a new tab in the editor and sets the provided SPARQL query in it. If the query is undefined, an empty tab
   * with the default query will be opened.
   * @param savedQuery - the query to be set in the new tab.
   * @returns A promise that resolves when the new tab is opened and the query is set. The resolved value is the opened
   * tab.
   */
  private async openNewTab(savedQuery: SavedQuery | undefined): Promise<void> {
    const yasguiComponent = await YasguiComponentUtil.getOntotextYasguiElementAsync(this.QUERY_EDITOR_ID);
    // Saved query can potentially be undefined that's why we skip the mapper. The yasgui component would deal with the
    // undefined query, but we need to make sure that the mapper is not called with an undefined value.
    const tabQueryModel = savedQuery && mapSavedQueryToTabQueryModel(savedQuery);
    const tab = await yasguiComponent.openTab(tabQueryModel);
    return YasguiComponentUtil.highlightTabName(tab);
  }

  private clearUrlParameters() {
    this.internallyReloaded = true;
    const currentParams = this.activatedRoute.snapshot.queryParams;
    // Keep only the repositoryId parameter (if any). This will prevent router event from being triggered again and
    // reinitializing the repositoryId param thus adding a new history entry.
    const repositoryId = currentParams[REPOSITORY_ID_PARAM];
    // Replace current URL without adding a new history entry
    void this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: repositoryId ? {repositoryId} : {},
      replaceUrl: true,
    });
  }

  private async autoExecuteQueryIfRequested(isRequested: boolean) {
    if (isRequested) {
      const yasguiComponent = await YasguiComponentUtil.getOntotextYasguiElementAsync(this.QUERY_EDITOR_ID);
      const result = await this.getQueryMode(yasguiComponent);
      return this.confirmAndExecuteQuery(result);
    }
  }

  private async getQueryMode(yasguiComponent: YasguiComponent) {
    const queryMode = await yasguiComponent.getQueryMode() as QueryMode;
    return {yasguiComponent, queryMode};
  }

  private confirmAndExecuteQuery({yasguiComponent, queryMode}: {yasguiComponent: YasguiComponent, queryMode: QueryMode}) {
    if (queryMode !== QueryMode.UPDATE) {
      return yasguiComponent.query();
    }

    return new Promise<void>((resolve) => {
      this.confirmationService.confirm({
        target: event!.target as EventTarget,
        message: this.translocoService.translate('sparql_editor.confirmation.on_auto_execute_query.message'),
        header: this.translocoService.translate('sparql_editor.confirmation.on_auto_execute_query.title'),
        rejectButtonProps: {
          label: this.translocoService.translate('components.dialog.confirmation.cancel_btn'),
          severity: 'secondary',
        },
        acceptButtonProps: {
          label: this.translocoService.translate('components.dialog.confirmation.confirm_btn'),
          severity: 'primary'
        },
        accept: () => {
          resolve(yasguiComponent.query());
        },
      });
    });
  }

  private getEndpoint(yasgui?: Yasgui) {
    const yasqe = this.getYasqe(yasgui);
    if (!yasqe) {
      // this can happen if open sparql view for first time (browser local store is clear);
      return '';
    }
    return this.resolveSparqlEndpoint(yasqe.getQueryMode());
  }

  private getYasqe(yasgui?: Yasgui){
    const tab = yasgui?.getTab();
    if (!tab) {
      return;
    }
    return tab.getYasqe();
  };

  private resolveSparqlEndpoint(queryMode: QueryMode) {
    const repositoryId = this.repositoryStorageService.getActiveRepositoryId();
    if (!repositoryId) {
      this.logger.error('No active repository found in local storage.');
      return '';
    }
    // if query mode is 'query' -> 'repositories/repo-name'
    // if query mode is 'update' -> 'repositories/repo-name/statements'
    if (queryMode === QueryMode.UPDATE) {
      return this.rdfRepositoryService.getStatementsEndpoint(repositoryId);
    } else if (queryMode === QueryMode.QUERY) {
      return this.rdfRepositoryService.getSparqlEndpoint(repositoryId);
    }
    return '';
  }

  /**
   * Handles the "requestAborted" event emitted by the ontotext-yasgui. The event is fired when a request is aborted.
   *
   * @param {RequestAbortedEvent} requestAbortedEvent the event payload containing the request object and the query mode.
   */
  private requestAbortedHandler(requestAbortedEvent: RequestAbortedEvent) {
    if (requestAbortedEvent && QueryMode.UPDATE !== requestAbortedEvent.queryMode) {
      const repositoryId = requestAbortedEvent.getRepository();
      const currentTrackAlias = requestAbortedEvent.getQueryTrackAlias();
      if (repositoryId && currentTrackAlias) {
        this.monitoringService.deleteQuery(currentTrackAlias, repositoryId)
          .catch((error) => {
            this.logger.error(`Failed to delete query with track alias ${currentTrackAlias} for repository ${repositoryId}:`, error);
          });
      }
    }
  }

  /**
   * Handles the "queryExecuted" event emitted by ontotext-yasgui. The event is fired immediately after the request is
   * executed, whether it succeeds or fails.
   * @param queryExecutedRequest - the event payload.
   */
  private queryExecutedHandler(queryExecutedRequest: QueryExecutedEvent){
    const connectorProgressModal = this.tabIdToConnectorProgressModalMapping.get(queryExecutedRequest.tabId);
    if (connectorProgressModal) {
      connectorProgressModal.dismiss();
      this.tabIdToConnectorProgressModalMapping.delete(queryExecutedRequest.tabId);
    }
  }

  private async getBeforeUpdateQueryHandler(query: string, tabId: string) {
    try {
      const result = await this.connectorsService.checkConnector(query);
      return this.showConnectorOperationProgressDialog(result, tabId);
    } catch (error) {
      // For some reason we couldn't check if this is a connector update, so just catch the exception,
      // to not stop the execution of query.
      this.logger.error('Checking connector error: ', error);
      return undefined;
    }
  }

  private showConnectorOperationProgressDialog(result: BeforeUpdateQueryResult, tabId?: string) {
    console.info('tabId', tabId);
    if (result.command === ConnectorCommand.CREATE) {
      // const connectorProgressModal = createConnectorProgressDialog($translate.instant('externalsync.creating'), result.iri, response.data.name);
      // tabIdToConnectorProgressModalMapping.set(tabId, connectorProgressModal);
    } else if (result.command === ConnectorCommand.REPAIR) {
      // const connectorProgressModal = createConnectorProgressDialog($translate.instant('externalsync.repairing'), response.data.iri, response.data.name);
      // tabIdToConnectorProgressModalMapping.set(tabId, connectorProgressModal);
    }
    return result;
  }

  private setInferAndSameAs(authenticatedUser: AuthenticatedUser | undefined) {
    this.inferUserSetting = authenticatedUser?.appSettings.DEFAULT_INFERENCE ?? false;
    this.sameAsUserSetting = authenticatedUser?.appSettings.DEFAULT_SAMEAS ?? false;
  }

  private getExitPageConfirmMessage(ongoingRequestsInfo: OngoingRequestsInfo){
    let exitPageConfirmMessage = 'sparql_editor.confirmation.on_page_leave.';
    if (!ongoingRequestsInfo || ongoingRequestsInfo.queriesCount < 1) {
      exitPageConfirmMessage += 'none_queries_';
    } else if (ongoingRequestsInfo.queriesCount === 1) {
      exitPageConfirmMessage += 'one_query_';
    } else {
      exitPageConfirmMessage += 'queries_';
    }

    if (!ongoingRequestsInfo.updatesCount || ongoingRequestsInfo.updatesCount === 0) {
      exitPageConfirmMessage += 'non_updates';
    } else if (ongoingRequestsInfo.updatesCount === 1) {
      exitPageConfirmMessage += 'one_update';
    } else {
      exitPageConfirmMessage += 'updates';
    }

    const params = {
      queriesCount: ongoingRequestsInfo.queriesCount,
      updatesCount: ongoingRequestsInfo.updatesCount,
    };
    return this.translocoService.translate(exitPageConfirmMessage, params);
  };

  /**
   * Persists the provided repository ID (which is the currently active repository) to local storage.
   * @param repositoryId the ID of the repository to persist as the last used repository.
   */
  private persistLastUsedRepository(repositoryId: string) {
    // The active repository is set when the controller is initialized and when the repository is changed.
    // It holds the actual repository when the YASGUI is initialized. DON'T use runtime fetching of the actual repository here, because there is a scenario:
    // 1. Open a tab with the SPARQL view open;
    // 2. Open the SPARQL view in another tab and execute a query;
    // 3. Switch to the repositories view and change the repository;
    // 4. Switch back to the SPARQL view, and the YASR is not cleared.
    // The problem occurs because of the second tab. When the repository is changed, its ID is persisted to local storage, which triggers the "storage" event to be fired.
    // In the main controller, a listener has been registered to listen to that event and refresh the page outside of the Angular scope.
    // Reloading the page triggers the destruction of the component and persistence of the active repository. The reloading of the page is out of the Angular scope, so the "activeRepository"
    // holds the real repository when the YASGUI is created. If we use $$repositories.getActiveRepository(), the new value will be fetched, which in this case will be incorrect.
    this.sparqlStorageService.setLastUsedRepository(repositoryId);
  }

  private repositoryChangedHandler(repositoryReference: RepositoryReference | undefined) {
    if (!repositoryReference) {
      return;
    }
    this.activeRepositoryReference = repositoryReference;
    this.isOntopRepo = this.repositoryContextService.isActiveRepoOntopType();
    const lastUsedRepositoryId = this.sparqlStorageService.getLastUsedRepository();
    if (lastUsedRepositoryId === this.activeRepositoryReference.id) {
      this.init(false);
    } else {
      this.init(true);
      this.persistLastUsedRepository(this.activeRepositoryReference.id);
    }
  }

  private beforeunloadHandler() {
    const ontotextYasguiElement = YasguiComponentUtil.getOntotextYasguiElement(this.QUERY_EDITOR_ID);
    if (!ontotextYasguiElement) {
      return;
    }
    // If we set event.returnValue, the browser will prompt the user for confirmation to leave the page,
    // but we don't have a way to handle the user's choice.
    // Therefore, we can't take any action, so we simply proceed to abort all requests.
    ontotextYasguiElement.abortAllRequests().then(() => {
      // After all requests are aborted, we can allow the page to be unloaded without prompting the user for confirmation.
    });
  }

  private readonly confirmIfHaveRunQuery = (ongoingRequestsInfo: OngoingRequestsInfo) => new Promise((resolve, reject) => {
    if (!ongoingRequestsInfo || ongoingRequestsInfo.queriesCount < 1 && ongoingRequestsInfo.updatesCount < 1) {
      resolve(false);
      return;
    }

    this.confirmationService.confirm({
      target: event!.target as EventTarget,
      header: this.translocoService.translate('sparql_editor.confirmation.on_page_leave.title'),
      message: this.getExitPageConfirmMessage(ongoingRequestsInfo),
      rejectButtonProps: {
        label: this.translocoService.translate('components.dialog.confirmation.cancel_btn'),
        severity: 'secondary',
      },
      acceptButtonProps: {
        label: this.translocoService.translate('components.dialog.confirmation.confirm_btn'),
        severity: 'primary'
      },

      accept: () => {
        resolve(true);
      },
      reject: () => {
        reject(new CancelAbortingQuery());
      }
    });
  });

  locationChangeHandler(eventPayload: NavigationStartPayload) {
    if (this.internallyReloaded) {
      this.internallyReloaded = false;
      return;
    }
    const ontotextYasguiElement = YasguiComponentUtil.getOntotextYasguiElement(this.QUERY_EDITOR_ID);
    if (!ontotextYasguiElement || this.queriesAreCanceled) {
      return;
    }

    const url = new URL(eventPayload.newUrl!);
    const newUrl = url.pathname + url.search + url.hash;
    eventPayload.cancelNavigation(undefined);
    // First, we check if there are any ongoing requests initiated by the user.
    // If the user has ongoing requests, we request confirmation to abort them.
    // If the user confirms or there are no ongoing requests, we call the "abortAllRequests" method. This method will abort all requests.
    ontotextYasguiElement
      .getOngoingRequestsInfo()
      .then((hasRunQuery) => this.confirmIfHaveRunQuery(hasRunQuery))
      .then(() => ontotextYasguiElement.abortAllRequests())
      .then(() => {
        this.queriesAreCanceled = true;
        navigateTo(newUrl)(eventPayload as unknown as Event);
      })
      .catch((error) => {
        if (!(error instanceof CancelAbortingQuery)) {
          this.logger.error(error);
          this.queriesAreCanceled = true;
          navigateTo(newUrl)(eventPayload as unknown as Event);
        }
      });
  }

  /**
   * Initializes the SPARQL editor page.
   * @param clearYasguiState
   */
  private init(clearYasguiState: boolean) {
    // This script check is required, because of the following scenario:
    // I am in the SPARQL view;
    // Then I go to a different view and change the language;
    // Then I return to the SPARQL view. I will see that the Google chart and Pivot table will have their
    // original scripts loaded still.
    // THE FIX: Get all the scripts (if there are none, the correct language will be loaded). If there are
    // scripts, and they don't match those, which are loaded already, the page needs to reload when opening
    // the SPARQL view, otherwise the Google chart and Pivot table configs will be in the old language.
    // const googleScripts = document.querySelectorAll(`script[src*="https://www.gstatic.com/"]`);
    // if (googleScripts.length > 0) {
    //   const currentLang = $languageService.getLanguage();
    //   let searchTerm = 'module.js';
    //   if ('en' !== currentLang) {
    //     searchTerm = `module__${currentLang}.js`;
    //   }
    //   if (!Array.prototype.some.call(googleScripts, (script) => script.src.includes(searchTerm))) {
    //     location.reload();
    //     return;
    //   }
    // }
    const authenticatedUser = this.securityContextService.getAuthenticatedUser();
    this.namespacesService.getNamespaces(this.repositoryStorageService.getActiveRepositoryId()!)
      .then((prefixes) => {
        this.prefixes = prefixes;
        this.setInferAndSameAs(authenticatedUser);
        this.initViewFromUrlParams(true);
      })
      .catch((error) => {
        this.logger.error('Error fetching namespaces for the active repository: ', error);
        // Even if fetching namespaces fails, we should still initialize the editor with an empty prefix list
        this.prefixes = new NamespaceMap({});
        this.setInferAndSameAs(authenticatedUser);
        this.updateConfig(clearYasguiState);
        this.initViewFromUrlParams(clearYasguiState);
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribeAll();
    window.removeEventListener('beforeunload', this.boundBeforeunloadHandler);
  }
}
