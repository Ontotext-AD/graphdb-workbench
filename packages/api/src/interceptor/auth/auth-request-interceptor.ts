import {HttpRequest} from '../../models/http/http-request';
import {HttpInterceptor} from '../../models/interceptor/http-interceptor';
import {AuthenticationStorageService} from '../../services/security/authentication-storage.service';
import {ServiceProvider} from '../../providers';
import {RepositoryStorageService} from '../../services/repository/repository-storage.service';
import {SecurityContextService} from '../../services/security/security-context.service';
import {OpenIdConfig} from '../../models/security/openid-config';

/**
 * AuthRequestInterceptor is responsible for intercepting HTTP requests and adding authentication
 * and repository information to the request headers.
 */
export class AuthRequestInterceptor extends HttpInterceptor<HttpRequest> {
  private readonly authStorage = ServiceProvider.get(AuthenticationStorageService);
  private readonly repositoryStorageService = ServiceProvider.get(RepositoryStorageService);
  private readonly securityContextService = ServiceProvider.get(SecurityContextService);

  /**
   * Preprocesses the HTTP request by adding authentication and repository information to the headers.
   *
   * This method performs the following tasks:
   * 1. Adds an authorization token to the request headers if available.
   * 2. Adds repository ID and location to the headers if available.
   *
   * @param request - The HTTP request to be processed.
   * @returns A Promise that resolves to the modified HTTP request.
   */
  process(request: HttpRequest): Promise<HttpRequest> {
    request.headers = request.headers || {};
    request.headers['X-Requested-With'] = 'XMLHttpRequest';

    const authToken = this.authStorage.getAuthToken().getValue();
    if (authToken) {
      request.headers.Authorization = authToken;
    }

    // There are requests that need to be sent to a repository different from the currently selected one.
    // For example, in the TTYG functionality, when creating or editing an agent, there is a check to see
    // if the autocomplete is enabled for the selected agent repository.
    // So we first check if repository headers are provided before setting them in local storage.
    if (!request.headers['X-GraphDB-Repository']) {
      const repositoryReference = this.repositoryStorageService.getRepositoryReference();
      if (repositoryReference?.id) {
        request.headers['X-GraphDB-Repository'] = repositoryReference.id;
      }

      if (repositoryReference?.location) {
        request.headers['X-GraphDB-Repository-Location'] = repositoryReference.location;
      }
    }
    return Promise.resolve(request);
  }

  shouldProcess(request: HttpRequest): boolean {
    // Skip header injection if the request is part of the OpenID authentication flow
    // (e.g., token retrieval or OpenID key discovery).
    // see https://github.com/Ontotext-AD/graphdb-workbench/blob/2.8/src/js/angular/core/interceptors/authentication.interceptor.js#L12
    const openIdConfig: OpenIdConfig | undefined = this.securityContextService.getOpenIdConfig();
    if (!openIdConfig) {
      return true;
    }

    const openIdKeysUri = openIdConfig?.openIdKeysUri;
    const openIdTokenUrl = openIdConfig?.openIdTokenUrl;

    if (openIdKeysUri && openIdTokenUrl) {
      const openIDUrls = [openIdConfig?.openIdKeysUri, openIdConfig?.openIdTokenUrl];
      const isOpenIdUrl = openIDUrls.some((url) => url && request.url.indexOf(url) > -1);
      return !isOpenIdUrl;
    }

    return true;
  }
}
