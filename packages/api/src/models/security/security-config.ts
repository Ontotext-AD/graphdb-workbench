import {Model} from '../common';
import {AuthSettings} from './auth-settings';
import {OpenidSecurityConfig} from './openid-security-config';
import {mapAuthSettingsResponseToModel} from '../../services/domain/security/mappers/auth-settings.mapper';
import {AuthSettingsResponseModel} from './response-models';
import {AuthenticationImplementation} from './authentication-implementation';
import {toEnum} from '../../services/utils';

/**
 * Represents the security configuration for the application.
 */
export class SecurityConfig extends Model<SecurityConfig> {
  authImplementation: AuthenticationImplementation;
  enabled?: boolean;
  passwordLoginEnabled?: boolean;
  freeAccess: AuthSettings;
  overrideAuth: AuthSettings;
  openIdEnabled: boolean;
  freeAccessActive?: boolean;
  // If the user comes from an external authentication system
  hasExternalAuth?: boolean;
  openidSecurityConfig?: OpenidSecurityConfig;
  allowSecurityToggle?: boolean;
  additionalAuthSources: AuthenticationImplementation[];

  constructor(config: Partial<SecurityConfig & {methodSettings: {openid: Partial<OpenidSecurityConfig>}}>) {
    super();
    this.authImplementation = toEnum(AuthenticationImplementation, config.authImplementation ?? AuthenticationImplementation.LOCAL);
    this.enabled = config.enabled;
    this.passwordLoginEnabled = config.passwordLoginEnabled;
    this.freeAccess = mapAuthSettingsResponseToModel(config.freeAccess as unknown as Partial<AuthSettingsResponseModel>);
    this.overrideAuth = mapAuthSettingsResponseToModel(config.overrideAuth as unknown as Partial<AuthSettingsResponseModel>);
    this.openIdEnabled = config.openIdEnabled ?? false;
    this.freeAccessActive = config.freeAccess?.enabled;
    this.hasExternalAuth = config.hasExternalAuth;
    this.allowSecurityToggle = config.allowSecurityToggle;
    if (config.methodSettings?.openid) {
      this.openidSecurityConfig = new OpenidSecurityConfig(config.methodSettings?.openid);
    }
    this.additionalAuthSources = (config.additionalAuthSources ?? []).map((source) => toEnum(AuthenticationImplementation, source));
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

  /**
   * Checks if GDB allows security disabling. If true, security can be toggled.
   * Otherwise, security cannot be toggled and is always enabled.
   *
   * @returns true if GDB allows toggling security, false otherwise
   */
  isSecurityToggleAllowed() {
    return this.allowSecurityToggle ?? true;
  }

  hasAdditionalAuthSource(): boolean {
    return !!this.additionalAuthSources.length;
  }

  getAuthenticationImplementation(): AuthenticationImplementation {
    return this.authImplementation;
  }

  isOpenIdEnabled(): boolean {
    return this.openIdEnabled;
  }

  isPasswordLoginEnabled(): boolean {
    return this.passwordLoginEnabled ?? false;
  }

  hasLocalAdditionalAuthSources(): boolean {
    return this.additionalAuthSources.includes(AuthenticationImplementation.LOCAL);
  }
}
