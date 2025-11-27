import {AuthSettings} from '../../../models/security/auth-settings';
import {Mapper} from '../../../providers/mapper/mapper';
import {AuthSettingsResponse} from '../../../models/security/response-models/auth-settings-response';
import {AuthorityListMapper} from './authority-list.mapper';
import {AppSettings} from '../../../models/users/app-settings';

/**
 * Mapper class for converting partial AuthSettings objects to complete AuthSettings models.
 */
export class AuthSettingsMapper extends Mapper<AuthSettings> {
  private readonly authorityListMapper = new AuthorityListMapper();
  /**
   * Maps partial AuthSettings data to a complete AuthSettings model.
   *
   * @param data - Partial data of AuthSettings to be mapped.
   * @returns A new instance of AuthSettings.
   */
  mapToModel(data: Partial<AuthSettingsResponse> = {}): AuthSettings {
    const appSettings = new AppSettings(data.appSettings);
    const authorities = this.authorityListMapper.mapToModel(data.authorities ?? []);

    return new AuthSettings({
      appSettings,
      authorities,
      enabled: data.enabled,
    });
  }
}
