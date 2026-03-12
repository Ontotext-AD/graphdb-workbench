import {Component, OnInit} from '@angular/core';
import {PageLayoutComponent} from '../../components/page-layout/page-layout.component';
import {MessageModule} from 'primeng/message';
import {TranslocoPipe} from '@jsverse/transloco';
import {PageInfoTooltipComponent} from '../../components/page-info-tooltip/page-info-tooltip.component';
import {
  YasguiComponentFacadeComponent
} from '../../components/yasgui-component-facade/yasgui-component-facade.component';
import {OntotextYasguiConfig} from '../../components/yasgui-component-facade/models/ontotext-yasgui-config';
import {VIEW_SPARQL_EDITOR} from '../../components/yasgui-component-facade/models/constants';
import {Prefixes} from '../../models/prefixes';
import {QueryType} from '../../components/yasgui-component-facade/models/query-type';
import {YasrToolbarPlugin} from '../../components/yasgui-component-facade/models/yasr-toolbar-plugin';
import {ConnectorCommand} from '../../models/connectors/connector-command';
import {LoggerProvider} from '../../services/logger-provider';
import {BeforeUpdateQueryResult} from '../../components/yasgui-component-facade/models/before-update-query-result';
import {EventDataType} from '../../components/yasgui-component-facade/models/event-data-type';
import {QueryExecutedEvent} from '../../components/yasgui-component-facade/models/query-executed-event';

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
export class SparqlEditorPageComponent implements OnInit {
  private readonly logger = LoggerProvider.logger;
  private readonly isOntopRepo = false;//$repositories.isActiveRepoOntopType();
  private inferUserSetting: boolean;
  private sameAsUserSetting: boolean;

  yasguiConfig: OntotextYasguiConfig;
  prefixes: Prefixes = {};// load prefixes

  ngOnInit(): void {
    this.updateConfig(false);
  }

  /**
   * Updates the Yasgui configuration
   * @param {boolean} clearYasguiState if set to true, the Yasgui will reinitialize and clear all tab results. Queries will remain.
   */
  updateConfig(clearYasguiState: unknown) {
    this.yasguiConfig = {
      // endpoint: getEndpoint,
      componentId: VIEW_SPARQL_EDITOR,
      prefixes: this.prefixes,
      infer: this.isOntopRepo || this.inferUserSetting,
      sameAs: this.isOntopRepo || this.sameAsUserSetting,
      yasrToolbarPlugins: [this.exploreVisualGraphYasrToolbarElementBuilder],
      beforeUpdateQuery: this.getBeforeUpdateQueryHandler(),
      outputHandlers: new Map([
        [EventDataType.QUERY_EXECUTED, queryExecutedHandler],
        [EventDataType.REQUEST_ABORTED, requestAbortedHandler],
      ]),
      clearState: clearYasguiState !== undefined ? clearYasguiState : false,
    };
  }

  /**
   * Handles the "queryExecuted" event emitted by ontotext-yasgui. The event is fired immediately after the request is executed, whether it succeeds or fails.
   * @param queryExecutedRequest - the event payload.
   */
  private queryExecutedHandler(queryExecutedRequest: QueryExecutedEvent) {
    // const connectorProgressModal = tabIdToConnectorProgressModalMapping.get(queryExecutedRequest.tabId);
    // if (connectorProgressModal) {
    //   connectorProgressModal.dismiss();
    //   tabIdToConnectorProgressModalMapping.delete(queryExecutedRequest.tabId);
    // }
  };

  private getBeforeUpdateQueryHandler() {
    return (query: string, tabId: string): Promise<BeforeUpdateQueryResult> => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return Promise.resolve();
    };
    // return ConnectorsRestService.checkConnector(query)
    //   .then((response) => {
    //     if (!response.data.command) {
    //       return toNoCommandResponse();
    //     }
    //     if (!response.data.hasSupport) {
    //       return toHasNotSupport(response);
    //     }
    //
    //     if (ConnectorCommand.CREATE === response.data.command) {
    //       return toCreateCommandResponse(response, tabId);
    //     }
    //
    //     if (ConnectorCommand.REPAIR === response.data.command) {
    //       return toRepairCommandResponse(response, tabId);
    //     }
    //
    //     if (ConnectorCommand.DROP === response.data.command) {
    //       return toDropCommandResponse(response);
    //     }
    //   }).catch((error: unknown) => {
    //     // For some reason we couldn't check if this is a connector update, so just catch the exception,
    //     // to not stop the execution of query.
    //     this.logger.error('Checking connector error: ', error);
    //   });
  }

  private setInferAndSameAs(principal: unknown){
    this.inferUserSetting = principal?.appSettings.DEFAULT_INFERENCE;
    this.sameAsUserSetting = principal?.appSettings.DEFAULT_SAMEAS;
  }

  private exploreVisualGraphYasrToolbarElementBuilder: YasrToolbarPlugin = {
    createElement: (yasr: unknown) => {
      const buttonName = document.createElement('span');
      buttonName.classList.add('explore-visual-graph-button-name');
      const exploreVisualButtonWrapperElement = document.createElement('button');
      exploreVisualButtonWrapperElement.classList.add('explore-visual-graph-button');
      exploreVisualButtonWrapperElement.classList.add('icon-data');
      exploreVisualButtonWrapperElement.onclick = function() {
        const paramsToParse = {
          query: yasr.yasqe.getValue(),
          sameAs: yasr.yasqe.getSameAs(),
          inference: yasr.yasqe.getInfer(),
        };
        // $location.path('graphs-visualizations').search(paramsToParse);
      };
      exploreVisualButtonWrapperElement.appendChild(buttonName);
      return exploreVisualButtonWrapperElement;
    },
    updateElement: (element: HTMLElement, yasr: unknown) => {
      element.classList.add('hidden');
      if (!yasr.hasResults()) {
        return;
      }
      const queryType = yasr.yasqe.getQueryType();

      if (QueryType.CONSTRUCT === queryType || QueryType.DESCRIBE === queryType) {
        element.classList.remove('hidden');
      }
      // element.querySelector('.explore-visual-graph-button-name').innerText = $translate.instant("query.editor.visual.btn");
    },
    getOrder: () => {
      return 2;
    },
    destroy(element: HTMLElement, yasr: unknown) {
      // No special cleanup is needed for this button, but the method must be implemented as part of the
      // YasrToolbarPlugin interface
    }
  };
}
