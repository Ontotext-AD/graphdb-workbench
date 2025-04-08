import {HttpRequest} from '../../models/http/http-request';
import {HttpInterceptor} from '../../models/interceptor/http-interceptor';
import {AuthenticationStorageService} from '../../services/security/authentication-storage.service';
import {ServiceProvider} from '../../providers/service/service.provider';
import {RepositoryContextService} from '../../services/repository/repository-context.service';
import {RepositoryStorageService} from '../../services/repository/repository-storage.service';

/**
 * AuthRequestInterceptor is responsible for intercepting HTTP requests and adding authentication
 * and repository information to the request headers.
 */
export class AuthRequestInterceptor extends HttpInterceptor<HttpRequest> {

  private readonly authStorage = ServiceProvider.get(AuthenticationStorageService);
  private readonly repositoryStorageService = ServiceProvider.get(RepositoryStorageService);
  private readonly repositoryContextService = ServiceProvider.get(RepositoryContextService);

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
    request.headers['X-Requested-With'] = 'XMLHttpRequest';

    const authToken = this.authStorage.getAuthToken().getValue();
    if (authToken) {
      request.headers.Authorization = authToken;
    }

    const repositoryId = this.repositoryStorageService.get(this.repositoryContextService.SELECTED_REPOSITORY_ID).getValue();
    if (repositoryId) {
      request.headers['X-GraphDB-Repository'] = repositoryId;
    }

    const repositoryLocation = this.repositoryStorageService.get(this.repositoryContextService.REPOSITORY_LOCATION).getValue();

    if (repositoryLocation) {
      request.headers['X-GraphDB-Repository-Location'] = repositoryLocation;
    }

    return Promise.resolve(request);
  }

  shouldProcess(): boolean {
    //TODO: when using OpenId this should be skipped
    return true;
  }
}
