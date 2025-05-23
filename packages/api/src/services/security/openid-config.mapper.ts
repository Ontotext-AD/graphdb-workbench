import {Mapper} from '../../providers/mapper/mapper';
import {OpenIdConfig} from '../../models/security/openid-config';

/**
 * Mapper class for converting partial OpenIdConfig objects to complete OpenIdConfig models.
 */
export class OpenidConfigMapper extends Mapper<OpenIdConfig> {
  /**
   * Maps the raw data to an instance of the {@link OpenIdConfig} model.
   *
   * @returns {OpenIdConfig} - A new OpenIdConfig instance.
   */
  mapToModel(data: Partial<OpenIdConfig>): OpenIdConfig {
    return new OpenIdConfig(data);
  }
}
