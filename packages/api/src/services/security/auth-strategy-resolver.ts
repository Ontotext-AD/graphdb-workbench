import {AuthStrategy} from '../../models/security/authentication/auth-strategy';
import {SecurityConfig} from '../../models/security';
import {GdbTokenAuthProvider} from '../../models/security/authentication/gdb-token-auth-provider';
import {NoSecurityProvider} from '../../models/security/authentication/no-security-provider';

export class AuthStrategyResolver {
  resolveStrategy(securityConfig: SecurityConfig): AuthStrategy {
    if (!securityConfig.enabled) {
      return new NoSecurityProvider();
    }

    if (!securityConfig.openIdEnabled) {
      return new GdbTokenAuthProvider();
    }
    return new NoSecurityProvider();
  }
}
