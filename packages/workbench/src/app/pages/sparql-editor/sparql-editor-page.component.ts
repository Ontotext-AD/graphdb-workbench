import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {PageLayoutComponent} from '../../components/page-layout/page-layout.component';
import {MessageModule} from 'primeng/message';
import {TranslocoPipe, TranslocoService} from '@jsverse/transloco';
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
  Rdf4jRepositoryService,
  RepositoryContextService,
  RepositoryReference,
  RepositoryStorageService,
  SecurityContextService,
  service,
  SubscriptionList,
} from '@ontotext/workbench-api';
import {EventDataType} from '../../components/yasgui-component-facade/models/event/event-data-type';
import {YasrToolbarPlugin} from '../../components/yasgui-component-facade/models/yasr/yasr-toolbar-plugin';
import {Yasr} from '../../components/yasgui-component-facade/models/yasr/yasr';
import {QueryType} from '../../components/yasgui-component-facade/models/yasqe/query-type';
import {Router} from '@angular/router';

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

  private readonly router = inject(Router);
  private readonly translocoService = inject(TranslocoService);

  private readonly rdfRepositoryService = service(Rdf4jRepositoryService);
  private readonly repositoryStorageService = service(RepositoryStorageService);
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly namespacesService = service(NamespacesService);

  private readonly subscriptions = new SubscriptionList();
  private isOntopRepo = this.repositoryContextService.isActiveRepoOntopType();
  private inferUserSetting = false;
  private sameAsUserSetting = false;
  private prefixes?: NamespaceMap;
  private readonly tabIdToConnectorProgressModalMapping = new Map();

  activeRepositoryReference: RepositoryReference | undefined;

  yasguiConfig = signal<OntotextYasguiConfig | undefined>(undefined);

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
    // config.beforeUpdateQuery = this.getBeforeUpdateQueryHandler();
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
    // const queryParams = $location.search();
    // if (queryParams.hasOwnProperty(RouteConstants.savedQueryName)) {
    //   // init new tab from shared saved query link
    //   initTabFromSavedQuery(queryParams);
    // } else if (queryParams.hasOwnProperty(RouteConstants.query)) {
    //   // init new tab from shared query link
    //   initTabFromSharedQuery(queryParams);
    // } else if (GuidesService.isActive()) {
    //   openNewTab();
    // }
  };

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

  // private getBeforeUpdateQueryHandler() {
  //   return (query: string, tabId: string): Promise<BeforeUpdateQueryResult> => {
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-expect-error
  //     return Promise.resolve();
  //   };
  //   // return ConnectorsRestService.checkConnector(query)
  //   //   .then((response) => {
  //   //     if (!response.data.command) {
  //   //       return toNoCommandResponse();
  //   //     }
  //   //     if (!response.data.hasSupport) {
  //   //       return toHasNotSupport(response);
  //   //     }
  //   //
  //   //     if (ConnectorCommand.CREATE === response.data.command) {
  //   //       return toCreateCommandResponse(response, tabId);
  //   //     }
  //   //
  //   //     if (ConnectorCommand.REPAIR === response.data.command) {
  //   //       return toRepairCommandResponse(response, tabId);
  //   //     }
  //   //
  //   //     if (ConnectorCommand.DROP === response.data.command) {
  //   //       return toDropCommandResponse(response);
  //   //     }
  //   //   }).catch((error: unknown) => {
  //   //     // For some reason we couldn't check if this is a connector update, so just catch the exception,
  //   //     // to not stop the execution of query.
  //   //     this.logger.error('Checking connector error: ', error);
  //   //   });
  // }

  private setInferAndSameAs(authenticatedUser: AuthenticatedUser | undefined) {
    this.inferUserSetting = authenticatedUser?.appSettings.DEFAULT_INFERENCE ?? false;
    this.sameAsUserSetting = authenticatedUser?.appSettings.DEFAULT_SAMEAS ?? false;
  }

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
    const authenticatedUser = this.securityContextService.getAuthenticatedUser();
    this.namespacesService.getNamespaces(this.repositoryStorageService.getActiveRepositoryId()!)
      .then((prefixes) => {
        this.prefixes = prefixes;
        this.setInferAndSameAs(authenticatedUser);
        this.updateConfig(true);
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
}
