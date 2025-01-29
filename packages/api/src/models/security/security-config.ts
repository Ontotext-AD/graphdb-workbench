import {Model} from '../common';
import {AuthSettings} from './auth-settings';
import {AuthSettingsMapper} from '../../services/security/mappers/auth-settings.mapper';
import {MapperProvider} from '../../providers';

/**
 * Represents the security configuration for the application.
 */
export class SecurityConfig extends Model<SecurityConfig> {
  authImplementation?: string;
  enabled?: boolean;
  passwordLoginEnabled?: boolean;
  freeAccess: AuthSettings;
  overrideAuth: AuthSettings;

  constructor(config: Partial<SecurityConfig>) {
    super();
    this.authImplementation = config.authImplementation;
    this.enabled = config.enabled;
    this.passwordLoginEnabled = config.passwordLoginEnabled;
    this.freeAccess = MapperProvider.get(AuthSettingsMapper).mapToModel(config.freeAccess);
    this.overrideAuth = MapperProvider.get(AuthSettingsMapper).mapToModel(config.overrideAuth);
  }
}
