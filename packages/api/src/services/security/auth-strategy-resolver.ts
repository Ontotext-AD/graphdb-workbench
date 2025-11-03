import {AuthStrategy} from '../../models/security/authentication';
import {SecurityConfig} from '../../models/security';
import {Service} from '../../providers/service/service';
import {NoSecurityStrategy} from './auth-strategies/no-security-strategy';
import {OpenidAuthStrategy} from './auth-strategies/openid-auth-strategy';
import {GdbTokenAuthStrategy} from './auth-strategies/gdb-token-auth-strategy';
import {service} from '../../providers';
import {AuthenticationStorageService} from './authentication-storage.service';
import {ExternalStrategy} from './auth-strategies/external-strategy';
import {SecurityContextService} from './security-context.service';

/**
 * Resolves the appropriate authentication strategy based on security configuration.
 *
 * This service acts as a factory that determines which authentication strategy
 * to use based on the current security settings:
 * - NoSecurityStrategy when security is disabled
 * - OpenIdAuthStrategy when OpenID Connect is enabled
 * - GdbTokenAuthStrategy for standard GraphDB token authentication
 */
export class AuthStrategyResolver implements Service {
  private readonly securityContextService = service(SecurityContextService);
  private readonly authStorageService = service(AuthenticationStorageService);
  private authStrategy: AuthStrategy | undefined;

  /**
   * Resolves and returns the appropriate authentication strategy. Sets the internal state strategy for future use.
   *
   * @param securityConfig The current security configuration
   * @returns The authentication strategy instance to use
   */
  resolveStrategy(securityConfig: SecurityConfig): AuthStrategy {
    this.authStrategy = this._resolveStrategy(securityConfig);
    return this.authStrategy;
  }

  /**
   * Gets the currently resolved authentication strategy.
   *
   * @returns The currently resolved authentication strategy, or undefined if not yet resolved
   */
  getAuthStrategy(): AuthStrategy | undefined {
    return this.authStrategy;
  }

  private _resolveStrategy(securityConfig: SecurityConfig): AuthStrategy {
    if (!securityConfig.isEnabled()) {
      return new NoSecurityStrategy();
    }

    if (securityConfig.openIdEnabled) {
      return new OpenidAuthStrategy();
    }

    const user = this.securityContextService.getAuthenticatedUser();
    // If we have a user, without an openID or GDB token, we assume it's an external auth
    return (user && !this.authStorageService.isGDBorOpenIDToken())
      ? new ExternalStrategy()
      : new GdbTokenAuthStrategy();
  }
}
