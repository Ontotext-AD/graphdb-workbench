import {AuthSettings} from '../../../models/security/auth-settings';
import {AuthSettingsResponseModel} from '../../../models/security/response-models/auth-settings-response-model';
import {AppSettings} from '../../../models/users/app-settings';
import {mapAuthorityListResponseToModel} from './authority-list.mapper';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Mapper class for converting partial AuthSettings objects to complete AuthSettings models.
 */
export const mapAuthSettingsResponseToModel: MapperFn<Partial<AuthSettingsResponseModel>, AuthSettings> = (data) => {
  const authSettings = new AuthSettings({});
  authSettings.appSettings = new AppSettings(data.appSettings);
  authSettings.authorities = mapAuthorityListResponseToModel(data.authorities || []);
  authSettings.enabled = data.enabled;
  return authSettings;
};
