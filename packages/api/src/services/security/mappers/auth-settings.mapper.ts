import {AuthSettings} from '../../../models/security/auth-settings';
import {Mapper} from '../../../providers/mapper/mapper';
import {AuthSettingsResponseModel} from '../../../models/security/response-models/auth-settings-response-model';
import {MapperProvider} from '../../../providers';
import {AuthorityListMapper} from './authority-list.mapper';

/**
 * Mapper class for converting partial AuthSettings objects to complete AuthSettings models.
 */
export class AuthSettingsMapper extends Mapper<AuthSettings> {
  /**
   * Maps partial AuthSettings data to a complete AuthSettings model.
   *
   * @param data - Partial data of AuthSettings to be mapped.
   * @returns A new instance of AuthSettings.
   */
  mapToModel(data: Partial<AuthSettingsResponseModel>): AuthSettings {
    const authSettings = new AuthSettings({});
    authSettings.appSettings = data.appSettings;
    authSettings.authorities = MapperProvider.get(AuthorityListMapper).mapToModel(data.authorities);
    authSettings.enabled = data.enabled;
    return authSettings;
  }
}
