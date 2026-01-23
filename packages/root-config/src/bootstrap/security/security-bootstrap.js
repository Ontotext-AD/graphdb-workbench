import {
  SecurityContextService,
  SecurityService,
  AuthStrategyResolver,
  AuthorizationService,
  WindowService,
  service,
  isLoginPage,
  navigate,
  EventService,
  Login,
  AuthenticationStorageService
} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';

const logger = LoggerProvider.logger;

export const loadSecurityConfig = () => {
  return service(SecurityService).getSecurityConfig()
    .then((securityConfig) => {
      const securityContextService = service(SecurityContextService);
      securityContextService.updateSecurityConfig(securityConfig);
      return loadAuthenticatedUser(securityConfig);
    })
    .catch((error) => {
      logger.error('Could not load security (config or authenticated user). Check the logs', error);
      throw error;
    });
};

const loadAuthenticatedUser = (securityConfig) => {
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

const initSecurity = () => {
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

const resolveNavigation = () => {
  const eventService = service(EventService);
  const authorizationService = service(AuthorizationService);
  const authStrategy = service(AuthStrategyResolver).getAuthStrategy();
  const isLoggedIn = service(SecurityContextService).getIsLoggedIn();

  if (isLoginPage() && ((isLoggedIn || authorizationService.hasFreeAccess()) && !authStrategy.isExternal())) {
    const params = new URLSearchParams(WindowService.getLocationQueryParams());
    const returnUrl = params.get('r') ?? './';

    navigate(returnUrl);
    eventService.emit(new Login());
  } else if (isLoginPage() && !isLoggedIn) {
    // stay on login page
  } else if (authorizationService.hasFreeAccess() || isLoggedIn) {
    eventService.emit(new Login());
  }
};

export const securityBootstrap = {loadSecurityConfig};
