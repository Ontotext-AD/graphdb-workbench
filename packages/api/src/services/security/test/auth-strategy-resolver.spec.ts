import { AuthStrategyResolver } from '../auth-strategy-resolver';
import { SecurityConfig } from '../../../models/security';
import {NoSecurityProvider} from '../auth-providers/no-security-provider';
import {GdbTokenAuthProvider} from '../auth-providers/gdb-token-auth-provider';

// Mock SecurityConfig type for test clarity
const getConfig = (enabled: boolean, openIdEnabled: boolean): SecurityConfig => ({
  enabled,
  openIdEnabled
} as SecurityConfig);

describe('AuthStrategyResolver', () => {
  let resolver: AuthStrategyResolver;

  beforeEach(() => {
    resolver = new AuthStrategyResolver();
  });

  it('should return NoSecurityProvider when security is disabled', () => {
    const config = getConfig(false, false);
    const strategy = resolver.resolveStrategy(config);
    expect(strategy).toBeInstanceOf(NoSecurityProvider);
  });

  it('should return GdbTokenAuthProvider when security is enabled and openId is disabled', () => {
    const config = getConfig(true, false);
    const strategy = resolver.resolveStrategy(config);
    expect(strategy).toBeInstanceOf(GdbTokenAuthProvider);
  });

  it('should return NoSecurityProvider when both security and openId are enabled (current behavior)', () => {
    const config = getConfig(true, true);
    const strategy = resolver.resolveStrategy(config);
    expect(strategy).toBeInstanceOf(NoSecurityProvider);
  });
});

