import {SecurityConfig} from '../../../models/security/security-config';
import {Mapper} from '../../../providers/mapper/mapper';
import {SecurityConfigDto, SecurityConfigInit} from '../../../models/security/security-config-dto';
import {AuthSettingsMapper} from './auth-settings.mapper';

/**
 * Mapper class for converting partial SecurityConfig objects to complete SecurityConfig models.
 */
export class SecurityConfigMapper extends Mapper<SecurityConfig> {
  private readonly authSettingsMapper = new AuthSettingsMapper();

  /**
   * Maps the raw data to an instance of the {@link SecurityConfig} model.
   *
   * @param {unknown} data - The raw data to be transformed into a model.
   * @returns {SecurityConfig} - A new SecurityConfig instance.
   */
  mapToModel(data: SecurityConfigDto | SecurityConfig): SecurityConfig {
    if (data instanceof SecurityConfig) {
      return data;
    }

    const freeAccess = this.authSettingsMapper.mapToModel(
      data.freeAccess ?? { authorities: [] }
    );

    const overrideAuth = this.authSettingsMapper.mapToModel(
      data.overrideAuth ?? { authorities: [] }
    );

    const init: SecurityConfigInit = {
      authImplementation: data.authImplementation,
      enabled: data.enabled,
      passwordLoginEnabled: data.passwordLoginEnabled,
      freeAccess,
      overrideAuth,
      openIdEnabled: data.openIdEnabled,
      userLoggedIn: data.userLoggedIn,
      freeAccessActive: data.freeAccessActive,
      hasExternalAuthUser: data.hasExternalAuthUser,
    };

    return new SecurityConfig(init);
  }
}
