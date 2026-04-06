import {Component, CUSTOM_ELEMENTS_SCHEMA, inject, input, ViewEncapsulation} from '@angular/core';
import {defineCustomElements} from 'ontotext-yasgui-web-component/loader';
import {OntotextYasguiConfig} from './models/yasgui/ontotext-yasgui-config';
import {SavedQueryConfig} from './models/query/saved-query-config';
import {
  SparqlService,
  service,
  OntoToastrService,
} from '@ontotext/workbench-api';
import {TranslocoService} from '@jsverse/transloco';

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
  yasguiConfig = input<OntotextYasguiConfig>();
  cssClass = input<string>('');

  private readonly translocoService = inject(TranslocoService);

  private readonly sparqlService = service(SparqlService);
  private readonly toastrService = service(OntoToastrService);

  afterInit: unknown;
  queryChanged: unknown;

  savedQueryConfig: SavedQueryConfig = {
    savedQueries: []
  };

  /**
   * The event is fired when saved queries should be loaded to be displayed to the user.
   */
  async loadSavedQueries() {
    try {
      const savedQueries = await this.sparqlService.getSavedQueries();
      // Recreate the config to trigger the watcher in the yasgui component that checks the identity only.
      this.savedQueryConfig = {
        savedQueries: savedQueries.getItems()
      };
    } catch (err) {
      this.toastrService.error(
        err instanceof Error ? err.message : String(err),
        {title: this.translocoService.translate('sparql_editor.errors.saved_queries_load_failed'),}
      );
    }
  };
}
