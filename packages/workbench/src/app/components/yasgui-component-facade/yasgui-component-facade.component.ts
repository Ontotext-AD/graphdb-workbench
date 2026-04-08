import {Component, CUSTOM_ELEMENTS_SCHEMA, inject, input, ViewEncapsulation} from '@angular/core';
import {defineCustomElements} from 'ontotext-yasgui-web-component/loader';
import {OntotextYasguiConfig} from './models/yasgui/ontotext-yasgui-config';
import {SavedQueryConfig} from './models/query/saved-query-config';
import {
  SparqlService,
  service,
  OntoToastrService,
  SaveQueryRequest,
} from '@ontotext/workbench-api';
import {TranslocoService} from '@jsverse/transloco';
import {SaveQueryEvent} from './models/query/save-query-event';

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
}
