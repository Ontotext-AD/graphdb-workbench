import {AuthenticationService, SecurityContextService, SecurityService, service} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';

const logger = LoggerProvider.logger;

export const loadSecurityConfig = () => {
  return service(SecurityService).getSecurityConfig()
    .then((securityConfig) => {
      service(SecurityContextService).updateSecurityConfig(securityConfig);
    })
    .catch((error) => {
      logger.error('Could not load security config', error);
      throw error;
    });
};

const subscribeToSecurityConfigChange = () => {
  const securityContextService = service(SecurityContextService);
  const authenticationService = service(AuthenticationService);

  securityContextService.onSecurityConfigChanged((securityConfig) => {
    if (securityConfig) {
      authenticationService.setAuthenticationStrategy(securityConfig);
    }
  });
};

export const securityBootstrap = {loadSecurityConfig, subscribeToSecurityConfigChange};
