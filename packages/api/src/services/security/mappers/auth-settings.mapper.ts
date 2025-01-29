import {AuthSettings} from '../../../models/security/auth-settings';
import {Mapper} from '../../../providers/mapper/mapper';

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
  mapToModel(data: Partial<AuthSettings>): AuthSettings {
    return new AuthSettings(data);
  }
}
