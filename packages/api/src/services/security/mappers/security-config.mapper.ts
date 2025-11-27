import {SecurityConfig} from '../../../models/security/security-config';
import {Mapper} from '../../../providers/mapper/mapper';
import {SecurityConfigResponse, SecurityConfigInit} from '../../../models/security/security-config-response';
import {AuthSettingsMapper} from './auth-settings.mapper';
import {OpenidSecurityConfig} from '../../../models/security';

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
  mapToModel(data: SecurityConfigResponse): SecurityConfig {
    const freeAccess = this.authSettingsMapper.mapToModel(data.freeAccess ?? {});
    const overrideAuth = this.authSettingsMapper.mapToModel(data.overrideAuth ?? {});

    const openidSecurityConfig = data.methodSettings?.openid
      ? new OpenidSecurityConfig(data.methodSettings.openid)
      : undefined;

    const init: SecurityConfigInit = {
      authImplementation: data.authImplementation,
      enabled: data.enabled,
      passwordLoginEnabled: data.passwordLoginEnabled,
      freeAccess,
      overrideAuth,
      openIdEnabled: data.openIdEnabled,
      freeAccessActive:
        data.freeAccessActive ?? data.freeAccess?.enabled,
      hasExternalAuth: data.hasExternalAuth,
      openidSecurityConfig,
    };

    return new SecurityConfig(init);
  }
}
