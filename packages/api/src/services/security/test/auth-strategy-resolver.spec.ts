import {AuthStrategyResolver} from '../auth-strategy-resolver';
import {OpenidSecurityConfig, SecurityConfig} from '../../../models/security';
import {NoSecurityProvider} from '../auth-providers/no-security-provider';
import {GdbTokenAuthProvider} from '../auth-providers/gdb-token-auth-provider';
import {OpenidAuthProvider} from '../auth-providers/openid-auth-provider';
import {service} from '../../../providers';
import {SecurityContextService} from '../security-context.service';

// Mock SecurityConfig type for test clarity
const getConfig = (enabled: boolean, openIdEnabled: boolean): SecurityConfig => {
  const securityConfig = new SecurityConfig({
    overrideAuth: {appSettings: {}},
    freeAccess: {appSettings: {}}
  } as unknown as SecurityConfig);
  if (enabled) {
    securityConfig.enabled = true;
  }
  if (openIdEnabled) {
    securityConfig.openIdEnabled = true;
    securityConfig.openidSecurityConfig = new OpenidSecurityConfig({clientId: 'test-client', issuer: 'https://test-issuer'});
  }
  return securityConfig;
}
;

describe('AuthStrategyResolver', () => {
  let resolver: AuthStrategyResolver;
  const securityContextService = service(SecurityContextService);

  beforeEach(() => {
    resolver = new AuthStrategyResolver();
  });

  afterEach(() => {
    securityContextService.updateSecurityConfig(undefined as unknown as SecurityConfig);
  });

  it('should return NoSecurityProvider when security is disabled', () => {
    const config = getConfig(false, false);
    securityContextService.updateSecurityConfig(config);
    const strategy = resolver.resolveStrategy(config);
    expect(strategy).toBeInstanceOf(NoSecurityProvider);
  });

  it('should return GdbTokenAuthProvider when security is enabled and openId is disabled', () => {
    const config = getConfig(true, false);
    securityContextService.updateSecurityConfig(config);
    const strategy = resolver.resolveStrategy(config);
    expect(strategy).toBeInstanceOf(GdbTokenAuthProvider);
  });

  it('should return OpenidAuthProvider when both security and openId are enabled (current behavior)', () => {
    const config = getConfig(true, true);
    securityContextService.updateSecurityConfig(config);
    const strategy = resolver.resolveStrategy(config);
    expect(strategy).toBeInstanceOf(OpenidAuthProvider);
  });
});
;

