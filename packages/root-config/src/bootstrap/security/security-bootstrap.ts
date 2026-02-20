import {
  AuthenticationStorageService,
  AuthorizationService,
  AuthStrategyResolver,
  EventService,
  isLoginPage,
  Login,
  navigate,
  SecurityContextService,
  SecurityService,
  service,
  WindowService,
  UrlPathParams,
  SecurityConfig, TrackingService, CookieConsent,
} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';

const logger = LoggerProvider.logger;

export const loadSecurityConfig = () => {
  return service(SecurityService).getSecurityConfig()
    .then((securityConfig) => {
      const securityContextService = service(SecurityContextService);
      console.log('%cbootstrap get config', 'background: red', securityConfig);
      securityContextService.updateSecurityConfig(securityConfig);
      return loadAuthenticatedUser(securityConfig);
    })
    .then(() => {
      const securityContextService = service(SecurityContextService);
      const trackingService = service(TrackingService);
      const isLoggedIn = securityContextService.getIsLoggedIn();
      const isFreeAccessEnabled = securityContextService.getSecurityConfig()?.isFreeAccessEnabled() || false;
      const securityEnabled = securityContextService.getSecurityConfig()?.isEnabled();
      const user = securityContextService.getAuthenticatedUser();
      const consent = trackingService.getCookieConsent();

      // If security is OFF, the cookie consent might be saved in the user data on the server
      // If security is ON
      //  - If the user is logged in, the cookie consent is saved in the user data on the server
      //  - If the user is not logged in, the cookie consent is saved in the local storage because the user is not authenticated
      // If free access is enabled
      //  - If the user is logged in, the cookie consent is saved in the user data on the server
      //  - If the user is not logged in, the cookie consent is saved in the local storage because the user is not authenticated

      // Here during the bootstrap we are interested in reading the cookie consent from the appropriate place and ensure
      // that it is properly applied in the user settings and user is updated in the context.
      console.log('%cbootstrap authenticatedUser', 'background: red', {isLoggedIn, isFreeAccessEnabled, securityEnabled, consent, user});
    })
    .catch((error) => {
      logger.error('Could not load security (config or authenticated user). Check the logs', error);
      throw error;
    });
};

const loadAuthenticatedUser = (securityConfig: SecurityConfig): Promise<void> => {
  const securityContextService = service(SecurityContextService);
  const securityService = service(SecurityService);
  if (securityConfig.isEnabled()) {
    return securityService.getAuthenticatedUser()
      .then((authenticatedUser) => securityContextService.updateAuthenticatedUser(authenticatedUser))
      .catch((error) => logger.error('Could not load authenticated user', error))
      .finally(() => initSecurity());
  } else {
    return initSecurity();
  }
};

const initSecurity = (): Promise<void> => {
  const securityContextService = service(SecurityContextService);
  const securityConfig = securityContextService.getSecurityConfig();
  const authStrategy = service(AuthStrategyResolver).resolveStrategy(securityConfig);
  const authorizationService = service(AuthorizationService);
  const authStorageService = service(AuthenticationStorageService);

  return authStrategy.initialize().then((isLoggedIn) => {
    authStorageService.setAuthenticated(authStrategy.isAuthenticated());
    securityContextService.updateIsLoggedIn(isLoggedIn);
    if (!isLoggedIn) {
      if (authorizationService.hasFreeAccess()) {
        authorizationService.initializeFreeAccess();
      } else if (securityConfig.hasOverrideAuth()) {
        authorizationService.initializeOverrideAuth();
      }
    }
    resolveNavigation();
  });
};

const resolveNavigation = (): void => {
  const eventService = service(EventService);
  const authorizationService = service(AuthorizationService);
  const authStrategy = service(AuthStrategyResolver).getAuthStrategy();
  const isLoggedIn = service(SecurityContextService).getIsLoggedIn();

  if (isLoginPage() && ((isLoggedIn || authorizationService.hasFreeAccess()) && !authStrategy.isExternal())) {
    // On login page but already logged in, navigate to return url or home page
    const params = new URLSearchParams(WindowService.getLocationQueryParams());
    const returnUrlParam = params.get('r');
    const returnUrl = returnUrlParam ? decodeURIComponent(returnUrlParam) : './';

    navigate(returnUrl);
    eventService.emit(new Login());
  } else if (isLoginPage() && !isLoggedIn) {
    // On login page but not logged in, do nothing and let the user log in
  } else if (authorizationService.hasFreeAccess() || isLoggedIn) {
    // Not on login page and has access, do nothing and let the user see the page
    eventService.emit(new Login());
  } else if (!authStrategy.isAuthenticated()) {
    // Not on login page and not authenticated, navigate to login page with return url
    const returnUrl = encodeURIComponent(WindowService.getLocationPathWithQueryParams());
    navigate(`login?${UrlPathParams.RETURN_URL}=${returnUrl}`);
  }
};

export const securityBootstrap = {loadSecurityConfig};
