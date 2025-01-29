import {SecurityConfig} from '../../../models/security/security-config';
import {Mapper} from '../../../providers/mapper/mapper';

/**
 * Mapper class for converting partial SecurityConfig objects to complete SecurityConfig models.
 */
export class SecurityConfigMapper extends Mapper<SecurityConfig> {
  /**
   * Maps the raw data to an instance of the {@link SecurityConfig} model.
   *
   * @returns {SecurityConfig} - A new SecurityConfig instance.
   */
  mapToModel(data: Partial<SecurityConfig>): SecurityConfig {
    return new SecurityConfig(data);
  }
}
