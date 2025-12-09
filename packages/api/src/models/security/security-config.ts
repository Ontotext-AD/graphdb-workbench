import {Model} from '../common';
import {AuthSettings} from './auth-settings';
import {OpenidSecurityConfig} from './openid-security-config';
import {mapAuthSettingsResponseToModel} from '../../services/security/mappers/auth-settings.mapper';
import {AuthSettingsResponseModel} from './response-models';

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

  constructor(config: Partial<SecurityConfig & {methodSettings: {openid: Partial<OpenidSecurityConfig>}}>) {
    super();
    this.authImplementation = config.authImplementation;
    this.enabled = config.enabled;
    this.passwordLoginEnabled = config.passwordLoginEnabled;
    this.freeAccess = mapAuthSettingsResponseToModel(config.freeAccess as unknown as Partial<AuthSettingsResponseModel>);
    this.overrideAuth = mapAuthSettingsResponseToModel(config.overrideAuth as unknown as Partial<AuthSettingsResponseModel>);
    this.openIdEnabled = config.openIdEnabled;
    this.freeAccessActive = config.freeAccess?.enabled;
    this.hasExternalAuth = config.hasExternalAuth;
    if (config.methodSettings?.openid) {
      this.openidSecurityConfig = new OpenidSecurityConfig(config.methodSettings?.openid);
    }
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
