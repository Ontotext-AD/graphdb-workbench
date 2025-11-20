import {AuthSettings} from '../../../models/security/auth-settings';
import {Mapper} from '../../../providers/mapper/mapper';
import {toObject} from '../../../providers/mapper/guards';

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
  mapToModel(data: unknown): AuthSettings {
    if (data instanceof AuthSettings) {
      return data;
    }
    const src = toObject<AuthSettings>(data);
    return new AuthSettings(src);
  }
}
