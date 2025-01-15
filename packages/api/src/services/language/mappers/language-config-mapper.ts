import { LanguageConfig } from '../../../models/language';
import { Mapper } from '../../../providers/mapper/mapper';

/**
 * Mapper class for LanguageConfig objects.
 */
export class LanguageConfigMapper extends Mapper<LanguageConfig> {
  /**
   * Maps the input data to a new LanguageConfig model instance.
   *
   * @param data - The LanguageConfig data to be mapped.
   * @returns A new LanguageConfig instance created from the input data.
   */
  mapToModel(data: LanguageConfig): LanguageConfig {
    return new LanguageConfig(data);
  }
}
