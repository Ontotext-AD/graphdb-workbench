import {AuthStrategy} from '../../models/security/authentication';
import {SecurityConfig} from '../../models/security';
import {Service} from '../../providers/service/service';
import {NoSecurityProvider} from './auth-providers/no-security-provider';
import {OpenidAuthProvider} from './auth-providers/openid-auth-provider';
import {GdbTokenAuthProvider} from './auth-providers/gdb-token-auth-provider';
import {service} from '../../providers';
import {AuthenticationStorageService} from './authentication-storage.service';
import {ExternalStrategy} from './auth-providers/external-strategy';
import {SecurityContextService} from './security-context.service';

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
  private readonly securityContextService = service(SecurityContextService);
  private readonly authStorageService = service(AuthenticationStorageService);

  /**
   * Resolves and returns the appropriate authentication strategy.
   *
   * @param securityConfig The current security configuration
   * @returns The authentication strategy instance to use
   */
  resolveStrategy(securityConfig: SecurityConfig): AuthStrategy {
    if (!securityConfig.isEnabled()) {
      return new NoSecurityProvider();
    }

    if (securityConfig.openIdEnabled) {
      return new OpenidAuthProvider();
    }

    const user = this.securityContextService.getAuthenticatedUser();
    // If we have a user, without an openID or GDB token, we assume it's an external auth
    return (user && !this.authStorageService.isGDBorOpenIDToken())
      ? new ExternalStrategy()
      : new GdbTokenAuthProvider();
  }
}
