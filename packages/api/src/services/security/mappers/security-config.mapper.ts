import {SecurityConfig} from '../../../models/security/security-config';
import {Mapper} from '../../../providers/mapper/mapper';
import { toObject } from '../../../providers/mapper/guards';

/**
 * Mapper class for converting partial SecurityConfig objects to complete SecurityConfig models.
 */
export class SecurityConfigMapper extends Mapper<SecurityConfig> {
  /**
   * Maps the raw data to an instance of the {@link SecurityConfig} model.
   *
   * @param {unknown} data - The raw data to be transformed into a model.
   * @returns {SecurityConfig} - A new SecurityConfig instance.
   */
  mapToModel(data: unknown): SecurityConfig {
    if (data instanceof SecurityConfig) {
      return data;
    }
    const src = toObject<SecurityConfig>(data);
    return new SecurityConfig(src);
  }
}
