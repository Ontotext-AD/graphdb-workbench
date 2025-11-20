import {Model} from '../common';
import {AuthSettings} from './auth-settings';
import {AuthSettingsMapper} from '../../services/security/mappers/auth-settings.mapper';

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
  userLoggedIn?: boolean;
  freeAccessActive?: boolean;
  hasExternalAuthUser?: boolean;

  private readonly authSettingsMapper = new AuthSettingsMapper();

  constructor(config: Partial<SecurityConfig>) {
    super();
    this.authImplementation = config.authImplementation;
    this.enabled = config.enabled;
    this.passwordLoginEnabled = config.passwordLoginEnabled;
    this.freeAccess = this.authSettingsMapper.mapToModel(config.freeAccess ?? {});
    this.overrideAuth = this.authSettingsMapper.mapToModel(config.overrideAuth ?? {});
    this.openIdEnabled = config.openIdEnabled;
    this.userLoggedIn = config.userLoggedIn;
    this.freeAccessActive = config.freeAccessActive;
    this.hasExternalAuthUser = config.hasExternalAuthUser;
  }
}
