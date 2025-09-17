import {ServiceProvider, SecurityContextService, SecurityService, getCurrentRoute} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';

const logger = LoggerProvider.logger;

export const loadSecurityConfig = () => {
  return ServiceProvider.get(SecurityService).getSecurityConfig()
    .then((securityConfig) => {
      ServiceProvider.get(SecurityContextService).updateSecurityConfig(securityConfig);
    })
    .catch((error) => {
      logger.error('Could not load security config', error);
      throw error;
    });
};

const subscribeToSecurityConfigChange = () => {
  const securityContextService = ServiceProvider.get(SecurityContextService);
  const securityService = ServiceProvider.get(SecurityService);
  securityContextService.onSecurityConfigChanged((securityConfig) => {
    // upon login, the user comes from the /login request. No need to query it again.
    if (securityConfig?.enabled && getCurrentRoute() !== 'login') {
      securityService.getAuthenticatedUser()
        .then((authenticatedUser) => {
          securityContextService.updateAuthenticatedUser(authenticatedUser);
        }).catch((error) => logger.error('Could not load authenticated user', error));
    }
  });
};

export const securityBootstrap = {loadSecurityConfig, subscribeToSecurityConfigChange};
