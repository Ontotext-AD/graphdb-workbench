import {AuthenticationService, SecurityContextService, SecurityService, service} from '@ontotext/workbench-api';
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
          .finally(() => resolve(setAuthenticationStrategy(securityConfig)));
      } else {
        resolve(setAuthenticationStrategy(securityConfig));
      }
    });
  });
};

const setAuthenticationStrategy = (securityConfig) => {
  const authenticationService = service(AuthenticationService);
  if (securityConfig && !authenticationService.isAuthenticationStrategySet()) {
    return authenticationService.setAuthenticationStrategy(securityConfig);
  }
  return Promise.resolve();
};

export const securityBootstrap = {loadSecurityConfig};
