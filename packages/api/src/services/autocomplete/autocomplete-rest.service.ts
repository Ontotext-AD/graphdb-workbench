import {AutocompleteSearchResult} from '../../models/rdf-search/autocomplete-search-result';
import {HttpService} from '../http/http.service';
import {ServiceProvider} from '../../providers';
import {RepositoryStorageService} from '../repository';
import {AuthenticationStorageService} from '../security';

/**
 * Service for handling autocomplete REST operations.
 */
export class AutocompleteRestService extends HttpService {
  private readonly autocompleteRestPrefix = '/rest/autocomplete';

  /**
   * Performs an autocomplete search based on the provided search term.
   *
   * @param searchTerm - The string to use for autocomplete search.
   * @returns A Promise that resolves to an AutocompleteSearchResult object containing search suggestions.
   */
  search(searchTerm: string): Promise<AutocompleteSearchResult> {
    return this.get(`${this.autocompleteRestPrefix}/query?q=${searchTerm}`, {}, this.createHeaders());
  }

  /**
   * Checks if the autocomplete feature is enabled.
   *
   * @returns A Promise that resolves to a boolean indicating whether autocomplete is enabled.
   */
  enabled(): Promise<boolean> {
    return this.get(`${this.autocompleteRestPrefix}/enabled`, {}, this.createHeaders());
  }

  // TODO: remove this, when the auth http interceptor is implemented,
  private createHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const token = ServiceProvider.get(AuthenticationStorageService).getAuthToken().getValue();
    if (token) {
      headers['Authorization'] = token;
    }

    const repositoryId = ServiceProvider.get(RepositoryStorageService).get('selectedRepositoryId').getValue();
    if (repositoryId) {
      headers['X-Graphdb-Repository'] = repositoryId;
    }
    return headers;
  }
}
