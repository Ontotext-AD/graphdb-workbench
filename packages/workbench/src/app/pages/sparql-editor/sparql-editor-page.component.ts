import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
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
  NamespaceMap,
  NamespacesService,
  Rdf4jRepositoryService, REPOSITORY_ID_PARAM,
  RepositoryContextService,
  RepositoryReference,
  RepositoryService,
  RepositoryStorageService,
  SavedQuery,
  SecurityContextService,
  ConnectorsService,
  service,
  SparqlService,
  SubscriptionList,
  BeforeUpdateQueryResult,
  OntoToastrService,
} from '@ontotext/workbench-api';
import {EventDataType} from '../../components/yasgui-component-facade/models/event/event-data-type';
import {YasrToolbarPlugin} from '../../components/yasgui-component-facade/models/yasr/yasr-toolbar-plugin';
import {Yasr} from '../../components/yasgui-component-facade/models/yasr/yasr';
import {QueryType} from '../../components/yasgui-component-facade/models/yasqe/query-type';

import {SavedQueryParams, SharedQueryParams} from './sparql-editor-query-params';
import {YasguiComponentUtil} from '../../components/yasgui-component-facade/yasgui-component-util';
import {YasguiComponent} from '../../components/yasgui-component-facade/models/yasgui-component';
import {ConnectorCommand} from '../../models/connectors/connector-command';
import {mapSavedQueryToTabQueryModel} from './mappers/saved-query-to-tab-query-model.mapper';

@Component({
  selector: 'app-sparql-editor-page',
  standalone: true,
  imports: [
    TranslocoPipe,
    MessageModule,
    PageLayoutComponent,
    PageInfoTooltipComponent,
    YasguiComponentFacadeComponent,
  ],
  templateUrl: './sparql-editor-page.component.html',
  styleUrl: './sparql-editor-page.component.scss',
})
export class SparqlEditorPageComponent implements OnInit, OnDestroy {
  private readonly logger = LoggerProvider.logger;
  // Angular DI
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly translocoService = inject(TranslocoService);
  // API DI
  private readonly rdfRepositoryService = service(Rdf4jRepositoryService);
  private readonly repositoryStorageService = service(RepositoryStorageService);
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly repositoryService = service(RepositoryService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly namespacesService = service(NamespacesService);
  private readonly sparqlService = service(SparqlService);
  private readonly connectorsService = service(ConnectorsService);
  private readonly ontoToastrService = service(OntoToastrService);
  // Private variables
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
  activeRepositoryReference: RepositoryReference | undefined;
  yasguiConfig = signal<OntotextYasguiConfig | undefined>(undefined);
  // savedQueryConfig = undefined;

  ngOnInit(): void {
    this.subscribeToRepositoryChanges();
  }

  /**
   * Updates the Yasgui configuration
   */
  updateConfig(clearYasguiState: boolean) {
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
    this.yasguiConfig.set(config);
  }

  /**
   * Initializes the editor from the URL parameters.
   * @param clearYasguiState if set to true, the Yasgui will reinitialize and clear all tab results. Queries will remain.
   * The default is false.
   */
  initViewFromUrlParams(clearYasguiState = false) {
    this.updateConfig(clearYasguiState);
    const queryParams = this.activatedRoute.snapshot.queryParams;
    if (queryParams.hasOwnProperty(SavedQueryParams.name)) {
      // init new tab from shared saved query link
      this.initTabFromSavedQuery(queryParams);
    } else if (queryParams.hasOwnProperty(SharedQueryParams.query)) {
      // init new tab from shared query link
      // initTabFromSharedQuery(queryParams);
    }
    // TODO: uncomment when GuidesService is available in the api module
    // else if (GuidesService.isActive()) {
    // openNewTab();
    // }
  }

  private initTabFromSavedQuery(queryParams: Params) {
    const savedQueryName = queryParams[SavedQueryParams.name];
    const savedQueryOwner = queryParams[SavedQueryParams.owner];
    const isExecuteRequested = queryParams['execute'] === 'true';
    console.info('%cinit from params', 'background: tan', {queryParams, savedQueryName, savedQueryOwner, isExecuteRequested});
    this.sparqlService.getSavedQuery(savedQueryName, savedQueryOwner)
      .then((savedQueryList) => {
        const savedQuery = savedQueryList.getFirstQuery();
        return this.openNewTab(savedQuery);
      })
      .then(() => this.clearUrlParameters())
      .then(() => this.autoExecuteQueryIfRequested(isExecuteRequested))
      .catch((err) => {
        this.ontoToastrService.error(
          this.translocoService.translate('query.editor.missing.saved.query.data.error', { // TODO: add the label in bundle
            savedQueryName: savedQueryName,
            error: err instanceof Error ? err.message : String(err),
          })
        );
      });
  }

  // const initTabFromSharedQuery = (queryParams) => {
  //   const queryName = queryParams[RouteConstants.name];
  //   const query = queryParams[RouteConstants.query];
  //   const queryOwner = queryParams[RouteConstants.owner];
  //   const isExecuteRequested = toBoolean(queryParams.execute);
  //   const sharedQueryModel = buildQueryModel(query, queryName, queryOwner, true);
  //   openNewTab(sharedQueryModel)
  //     .then(clearUrlParameters)
  //     .then(() => autoExecuteQueryIfRequested(isExecuteRequested));
  // };

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
      // const title = this.translocoService.translate('confirm.execute');
      // const message = decodeHTML(this.translocoService.translate('query.editor.automatically.execute.update.warning'));
      const message = this.translocoService.translate('query.editor.automatically.execute.update.warning');
      // ModalService.openConfirmation(title, message, () => resolve(yasguiComponent.query()), () => resolve());
      const confirmed = confirm(message);
      if (confirmed) {
        resolve(yasguiComponent.query());
      } else {
        resolve();
      }
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
      const repository = requestAbortedEvent.getRepository();
      const currentTrackAlias = requestAbortedEvent.getQueryTrackAlias();
      if (repository && currentTrackAlias) {
        // MonitoringRestService.deleteQuery(currentTrackAlias, repository);
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

  // const getExitPageConfirmMessage = (ongoingRequestsInfo) => {
  //   let exitPageConfirmMessage = "view.sparql-editor.leave_page.run_queries.confirmation.";
  //   if (!ongoingRequestsInfo || ongoingRequestsInfo.queriesCount < 1) {
  //     exitPageConfirmMessage += "none_queries_";
  //   } else if (ongoingRequestsInfo.queriesCount === 1) {
  //     exitPageConfirmMessage += "one_query_";
  //   } else {
  //     exitPageConfirmMessage += "queries_";
  //   }
  //
  //   if (!ongoingRequestsInfo.updatesCount || ongoingRequestsInfo.updatesCount === 0) {
  //     exitPageConfirmMessage += "non_updates";
  //   } else if (ongoingRequestsInfo.updatesCount === 1) {
  //     exitPageConfirmMessage += "one_update";
  //   } else {
  //     exitPageConfirmMessage += "updates";
  //   }
  //
  //   exitPageConfirmMessage += ".message";
  //   const params = {
  //     queriesCount: ongoingRequestsInfo.queriesCount,
  //     updatesCount: ongoingRequestsInfo.updatesCount,
  //   };
  //   return $translate.instant(exitPageConfirmMessage, params);
  // };

  private subscribeToRepositoryChanges() {
    this.subscriptions.add(
      this.repositoryContextService.onSelectedRepositoryChanged((repositoryReference) => {
        if (!repositoryReference) {
          return;
        }
        this.activeRepositoryReference = repositoryReference;
        this.isOntopRepo = this.repositoryContextService.isActiveRepoOntopType();
        this.init();
        // const activeRepository = this.repositoryStorageService.getActiveRepositoryId();
        // if (LocalStorageAdapter.get(LSKeys.SPARQL_LAST_REPO) !== activeRepository) {
        //   init(true);
        //   persistLasstUsedRepository();
        // } else {
        //   init(false);
        // }
      })
    );
  }

  private init() {
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
        this.updateConfig(true);
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribeAll();
  }

  // TODO: Migrate event handlers
  //repositoryChangedHandler
  //beforeunloadHandler
  //confirmIfHaveRunQuery
  //locationChangeHandler
  //...
}
