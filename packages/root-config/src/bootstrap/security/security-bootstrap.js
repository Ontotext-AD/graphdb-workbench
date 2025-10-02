import {AuthenticationService, SecurityContextService, SecurityService, service} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';

const logger = LoggerProvider.logger;

export const loadSecurityConfig = () => {
  return service(SecurityService).getSecurityConfig()
    .then((securityConfig) => {
      const securityContextService = service(SecurityContextService);
      const authenticationService = service(AuthenticationService);

      securityContextService.updateSecurityConfig(securityConfig);
      if (securityConfig && !authenticationService.isAuthenticationStrategySet()) {
        return authenticationService.setAuthenticationStrategy(securityConfig);
      }
    })
    .catch((error) => {
      logger.error('Could not load security config', error);
      throw error;
    });
};

export const securityBootstrap = {loadSecurityConfig};
