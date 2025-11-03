import {HttpInterceptor} from '../../models/interceptor/http-interceptor';
import {getPathName, navigate} from '../../services/utils';
import {AuthenticationService} from '../../services/security/authentication.service';
import {SecurityContextService} from '../../services/security/security-context.service';
import {service} from '../../providers';
import {LoggerProvider} from '../../services/logging/logger-provider';

/**
 * Interceptor that handles HTTP 403 Forbidden responses.
 * When a 403 response is received, it checks if the current page is restricted
 * and updates the security context accordingly. If the user is not authenticated,
 * it redirects them to the login page.
 */
export class UnauthorizedInterceptor extends HttpInterceptor<Response> {
  private readonly securityContextService = service(SecurityContextService);
  private readonly authenticationService = service(AuthenticationService);
  private readonly logger = LoggerProvider.logger;

  shouldProcess(data: Response): boolean {
    // If backend returns 403, it means that the user is not authorized for this resource.
    return 403 === data.status;
  }

  process(data: Response): Promise<Response> {
    const path = getPathName();

    this.logger.warn('Permission to page denied. Some errors in the console are normal');
    this.updateRestrictionsForPage(path);

    if (this.shouldRedirectToLogin()) {
      navigate('login');
    }

    return Promise.reject(data);
  }

  updateRestrictionsForPage(path: string): void {
    const restrictedPages = this.securityContextService.getRestrictedPages();

    if (restrictedPages && !restrictedPages.isRestricted(path)) {
      restrictedPages.setPageRestriction(path);
      this.securityContextService.updateRestrictedPages(restrictedPages);
    }
  }

  shouldRedirectToLogin(): boolean {
    return !this.authenticationService.isAuthenticated();
  }
}
