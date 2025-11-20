import {AvailableLanguagesList, LanguageConfig} from '../../../models/language';
import { Mapper } from '../../../providers/mapper/mapper';
import { toObject } from '../../../providers/mapper/guards';

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
  mapToModel(data: unknown): LanguageConfig {
    if (data instanceof LanguageConfig) {
      return data;
    }
    const src = toObject<LanguageConfig>(data);
    const normalized: LanguageConfig = {
      defaultLanguage: src.defaultLanguage ?? '',
      availableLanguages: src.availableLanguages ?? new AvailableLanguagesList([])
    } as LanguageConfig;
    return new LanguageConfig(normalized);
  }
}
