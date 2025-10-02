import {AuthStrategyResolver} from '../auth-strategy-resolver';
import {OpenidSecurityConfig, SecurityConfig} from '../../../models/security';
import {NoSecurityProvider} from '../auth-providers/no-security-provider';
import {GdbTokenAuthProvider} from '../auth-providers/gdb-token-auth-provider';
import {OpenidAuthProvider} from '../auth-providers/openid-auth-provider';
import {service} from '../../../providers';
import {SecurityContextService} from '../security-context.service';

const getDisabledSecurityConfig = () => {
  return new SecurityConfig({
    enabled: false,
    overrideAuth: {appSettings: {}},
    freeAccess: {appSettings: {}}
  } as unknown as SecurityConfig);
};

const getEnabledSecurityConfig = () => {
  return new SecurityConfig({
    enabled: true,
    overrideAuth: {appSettings: {}},
    freeAccess: {appSettings: {}}
  } as unknown as SecurityConfig);
};

const getOpenIdEnabledSecurityConfig = () => {
  return new SecurityConfig({
    enabled: true,
    openIdEnabled: true,
    openidSecurityConfig: new OpenidSecurityConfig({clientId: 'test-client', issuer: 'https://test-issuer'}),
    overrideAuth: {appSettings: {}},
    freeAccess: {appSettings: {}}
  } as unknown as SecurityConfig);
};

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
    const config = getDisabledSecurityConfig();
    securityContextService.updateSecurityConfig(config);
    const strategy = resolver.resolveStrategy(config);
    expect(strategy).toBeInstanceOf(NoSecurityProvider);
  });

  it('should return GdbTokenAuthProvider when security is enabled and openId is disabled', () => {
    const config = getEnabledSecurityConfig();
    securityContextService.updateSecurityConfig(config);
    const strategy = resolver.resolveStrategy(config);
    expect(strategy).toBeInstanceOf(GdbTokenAuthProvider);
  });

  it('should return OpenidAuthProvider when both security and openId are enabled (current behavior)', () => {
    const config = getOpenIdEnabledSecurityConfig();
    securityContextService.updateSecurityConfig(config);
    const strategy = resolver.resolveStrategy(config);
    expect(strategy).toBeInstanceOf(OpenidAuthProvider);
  });
});
;

