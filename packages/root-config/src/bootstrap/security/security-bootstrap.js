import {ServiceProvider, SecurityContextService, SecurityService} from '@ontotext/workbench-api';

const loadSecurityConfig = () => {
  return ServiceProvider.get(SecurityService).getSecurityConfig()
    .then((securityConfig) => {
      ServiceProvider.get(SecurityContextService).updateSecurityConfig(securityConfig);
    })
    .catch((error) => {
      throw new Error('Could not load security config', error);
    });
};

export const securityBootstrap = [loadSecurityConfig];
