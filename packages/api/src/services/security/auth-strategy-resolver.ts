import {AuthStrategy} from '../../models/security/authentication';
import {SecurityConfig} from '../../models/security';
import {Service} from '../../providers/service/service';
import {NoSecurityProvider} from './auth-providers/no-security-provider';
import {OpenidAuthProvider} from './auth-providers/openid-auth-provider';
import {GdbTokenAuthProvider} from './auth-providers/gdb-token-auth-provider';

/**
 * Resolves the appropriate authentication strategy based on security configuration.
 *
 * This service acts as a factory that determines which authentication provider
 * to use based on the current security settings:
 * - NoSecurityProvider when security is disabled
 * - OpenIdAuthProvider when OpenID Connect is enabled
 * - GdbTokenAuthProvider for standard GraphDB token authentication
 */
export class AuthStrategyResolver implements Service {
  /**
   * Resolves and returns the appropriate authentication strategy.
   *
   * @param securityConfig The current security configuration
   * @returns The authentication strategy instance to use
   */
  resolveStrategy(securityConfig: SecurityConfig): AuthStrategy {
    if (!securityConfig.enabled) {
      return new NoSecurityProvider();
    }

    if (securityConfig.openIdEnabled) {
      return new OpenidAuthProvider();
    } else {
      return new GdbTokenAuthProvider();
    }
  }
}
