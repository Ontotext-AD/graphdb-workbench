import {Component, computed, CUSTOM_ELEMENTS_SCHEMA, input, ViewEncapsulation} from '@angular/core';
import {defineCustomElements} from 'ontotext-yasgui-web-component/loader';
import {OntotextYasguiConfig} from './models/yasgui/ontotext-yasgui-config';
import {QueryMode} from './models/query-mode';
import {QueryType} from './models/yasqe/query-type';
import {Yasgui} from './models/yasgui/yasgui';

import {
  AuthenticationStorageService,
  HttpHeaders,
  ObjectUtil,
  RepositoryContextService,
  service,
} from '@ontotext/workbench-api';

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
  private readonly repositoryContextService: RepositoryContextService = service(RepositoryContextService);
  private readonly authenticationStorageService: AuthenticationStorageService = service(AuthenticationStorageService);

  yasguiConfig = input<OntotextYasguiConfig>();
  cssClass = input<string>('');

  afterInit: unknown;

  queryChanged: unknown;

  /**
   * Computed YASGUI configuration.
   *
   * This configuration is derived by:
   * - Taking the current provided `yasguiConfig` (if available)
   * - Falling back to a default `OntotextYasguiConfig` instance
   * - Merging both, where provided values take precedence. Default values are used only when user values are `undefined`.
   *
   * @returns {OntotextYasguiConfig} The resolved and normalized YASGUI configuration
   */
  config = computed(() => {
    const yasguiConfig = this.yasguiConfig() ?? new OntotextYasguiConfig();
    const defaultConfig = this.getDefaultConfig();
    return ObjectUtil.mergeWithDefaults<OntotextYasguiConfig>(yasguiConfig, defaultConfig);
  });

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
    };
  };

  /**
   * Generates HTTP headers for executing a SPARQL query from YASGUI.
   *
   * @param {Yasgui} yasgui - Active YASGUI instance
   * @returns {HttpHeaders | undefined} Generated HTTP headers or undefined if no active tab exists
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
  };
}
