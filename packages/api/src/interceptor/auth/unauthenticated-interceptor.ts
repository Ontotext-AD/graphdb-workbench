import {HttpInterceptor} from '../../models/interceptor/http-interceptor';
import {isLoginPage, navigate} from '../../services/utils';
import {WindowService} from '../../services/window';
import {service} from '../../providers';
import {AuthenticationStorageService} from '../../services/security/authentication-storage.service';
import {AuthenticationService} from '../../services/security';

/**
 * Interceptor that handles HTTP 401 Unauthorized responses.
 * When a 401 response is received, it clears the authentication token,
 * redirects the user to the login page, and reloads the application to ensure
 * proper initialization.
 */
export class UnauthenticatedInterceptor extends HttpInterceptor<Response> {
  private readonly authenticationStorageService = service(AuthenticationStorageService);
  private readonly authenticationService = service(AuthenticationService);

  shouldProcess(data: Response): boolean {
    // If backend returns 401, it means that the user is not authenticated.
    return 401 === data.status;
  }

  process(data: Response): Promise<Response> {
    if (this.shouldRedirectToLogin(data.url)) {
      // Redirect to login page only if this isn't the endpoint that gets the logged user and when no external authentication is available.
      // This check is essential for making free access, no security access and external auth working.

      this.authenticationStorageService.clearAuthToken();
      if (!isLoginPage()) {
        navigate('login');
        // There is scenario when 401 is thrown during bootstrap and
        // when user is logged the workbench is not properly loaded
        // For example if languages are not loaded.
        // So we need to reload the page to ensure that everything is loaded properly.
        WindowService.getWindow().location.reload();
      }
      return Promise.reject(data);
    }

    return Promise.resolve(data);
  }

  shouldRedirectToLogin(url: string): boolean {
    return url.indexOf('rest/security/authenticated-user') < 0 && !this.authenticationService.isExternalUser();
  }
}
