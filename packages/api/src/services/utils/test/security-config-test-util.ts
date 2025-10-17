import {OpenidSecurityConfig, SecurityConfig} from '../../../models/security';

export class SecurityConfigTestUtil {
  static createSecurityConfig(securityConfigOverrides?: Partial<SecurityConfig>, openidConfig?: OpenidSecurityConfig): SecurityConfig {
    const config = {
      enabled: false,
      freeAccess: {},
      overrideAuth: {},
      ...securityConfigOverrides
    } as SecurityConfig;
    const securityConfig = new SecurityConfig(config);
    if (openidConfig) {
      const openIdConfiguration = new OpenidSecurityConfig(openidConfig);
      securityConfig.openidSecurityConfig = openIdConfiguration;
    }
    return securityConfig;
  }
}
