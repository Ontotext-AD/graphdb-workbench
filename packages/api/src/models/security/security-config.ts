import {Model} from '../common';
import {AuthSettings} from './auth-settings';
import {OpenidSecurityConfig} from './openid-security-config';
import {SecurityConfigInit} from './security-config-response';

/**
 * Represents the security configuration for the application.
 */
export class SecurityConfig extends Model<SecurityConfig> {
  authImplementation?: string;
  enabled?: boolean;
  passwordLoginEnabled?: boolean;
  freeAccess: AuthSettings;
  overrideAuth: AuthSettings;
  openIdEnabled?: boolean;
  freeAccessActive?: boolean;
  // If the user comes from an external authentication system
  hasExternalAuth?: boolean;
  openidSecurityConfig?: OpenidSecurityConfig;

  constructor(config: SecurityConfigInit = {}) {
    super();
    this.authImplementation = config.authImplementation;
    this.enabled = config.enabled;
    this.passwordLoginEnabled = config.passwordLoginEnabled;
    this.freeAccess = config.freeAccess ?? new AuthSettings({});
    this.overrideAuth = config.overrideAuth ?? new AuthSettings({});
    this.openIdEnabled = config.openIdEnabled;
    this.freeAccessActive = config.freeAccessActive;
    this.hasExternalAuth = config.hasExternalAuth;
    this.openidSecurityConfig = config.openidSecurityConfig;
  }

  isEnabled() {
    return this.enabled ?? false;
  }

  isFreeAccessEnabled() {
    return this.freeAccess.enabled ?? false;
  }

  getFreeAccessAuthSettings() {
    return this.freeAccess;
  }

  hasOverrideAuth() {
    return this.overrideAuth?.enabled ?? false;
  }
}
