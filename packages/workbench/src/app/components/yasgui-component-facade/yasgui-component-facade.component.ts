import {Component, CUSTOM_ELEMENTS_SCHEMA, inject, input, ViewEncapsulation} from '@angular/core';
import {defineCustomElements} from 'ontotext-yasgui-web-component/loader';
import {OntotextYasguiConfig} from './models/yasgui/ontotext-yasgui-config';
import {SavedQueryConfig} from './models/query/saved-query-config';
import {
  SparqlService,
  service,
  OntoToastrService,
  SaveQueryRequest,
  WindowService,
} from '@ontotext/workbench-api';
import {TranslocoService} from '@jsverse/transloco';
import {SaveQueryEvent} from './models/query/save-query-event';
import {SavedQueryParams} from '../../pages/sparql-editor/sparql-editor-query-params';
import {YasguiComponentUtil} from './yasgui-component-util';
import {EventData} from './models/event/event-data';
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
export class YasguiComponentFacadeComponent {
  // ===================================
  // Angular injections
  // ===================================
  private readonly translocoService = inject(TranslocoService);

  // ===================================
  // API module injections
  // ===================================
  private readonly sparqlService = service(SparqlService);
  private readonly toastrService = service(OntoToastrService);

  // ===================================
  // Public variables
  // ===================================
  yasguiConfig = input<OntotextYasguiConfig>();
  cssClass = input<string>('');

  afterInit: unknown;
  queryChanged: unknown;
  savedQueryConfig: SavedQueryConfig = {
    savedQueries: [],
    saveSuccess: false,
  };

  // ===================================
  // Private variables
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
      .catch((err: unknown) => this.querySaveErrorHandler(err));
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
      .catch((err: unknown) => this.querySaveErrorHandler(err));
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
  };

  // ===================================
  // Private methods
  // ===================================

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
  };

  private querySaveErrorHandler(err: unknown) {
    const errorMessage = this.translocoService.translate('sparql_editor.errors.query_save_failed');
    this.toastrService.error(
      err instanceof Error ? err.message : String(err),
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

  private toEventData(event: OntotextYasguiEvent) {
    return new EventData(event.detail.type, event.detail.payload);
  }

  private toYasguiOutputModel(event: Event): YasguiOutputEvent {
    const eventData = event as unknown as OntotextYasguiEvent;
    switch (eventData.type) {
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
    default:
      return eventData;
    }
  }
}
