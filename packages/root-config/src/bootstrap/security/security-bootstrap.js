import {
  SecurityContextService,
  SecurityService,
  AuthStrategyResolver,
  AuthorizationService,
  service,
  isLoginPage,
  navigate,
  EventService,
  Login
} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';

const logger = LoggerProvider.logger;

export const loadSecurityConfig = () => {
  return service(SecurityService).getSecurityConfig()
    .then((securityConfig) => {
      const securityContextService = service(SecurityContextService);
      securityContextService.updateSecurityConfig(securityConfig);
      return subscribeToAuthenticatedUserChange();
    })
    .catch((error) => {
      logger.error('Could not load security config', error);
      throw error;
    });
};

const subscribeToAuthenticatedUserChange = () => {
  const securityContextService = service(SecurityContextService);
  const securityService = service(SecurityService);
  return new Promise((resolve) => {
    securityContextService.onSecurityConfigChanged((securityConfig) => {
      if (securityConfig.isEnabled()) {
        securityService.getAuthenticatedUser()
          .then((authenticatedUser) => securityContextService.updateAuthenticatedUser(authenticatedUser))
          .catch((error) => logger.error('Could not load authenticated user', error))
          // Always resolve the promise, even if there was an error fetching the user
          // Error here is a completely valid scenario and shouldn't stop the app from loading,
          // but the app should wait until this process is finished before continuing
          .finally(() => resolve(initSecurity()));
      } else {
        resolve(initSecurity());
      }
    });
  });
};

const initSecurity = () => {
  const securityContextService = service(SecurityContextService);
  const securityConfig = securityContextService.getSecurityConfig();
  const authStrategy = service(AuthStrategyResolver).resolveStrategy(securityConfig);
  const authorizationService = service(AuthorizationService);

  return authStrategy.initialize().then((isLoggedIn) => {
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
    navigate('./');
    eventService.emit(new Login());
  } else if (isLoginPage() && !isLoggedIn) {
    // stay on login page
  } else if (authorizationService.hasFreeAccess() || isLoggedIn) {
    eventService.emit(new Login());
  }
};

export const securityBootstrap = {loadSecurityConfig};
