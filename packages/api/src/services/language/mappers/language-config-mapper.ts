import {LanguageConfig} from '../../../models/language';
import { Mapper } from '../../../providers/mapper/mapper';
import {AvailableLanguagesListMapper} from './available-languages-list-mapper';

export interface LanguageConfigDto {
  defaultLanguage: string;
  availableLanguages: AvailableLanguageDto[];
}

export interface AvailableLanguageDto {
  key: string;
  name: string;
}

/**
 * Mapper class for LanguageConfig objects.
 */
export class LanguageConfigMapper extends Mapper<LanguageConfig> {
  private readonly availableLanguagesListMapper = new AvailableLanguagesListMapper();
  /**
   * Maps the input data to a new LanguageConfig model instance.
   *
   * @param data - The LanguageConfig data to be mapped.
   * @returns A new LanguageConfig instance created from the input data.
   */
  mapToModel(data: LanguageConfigDto | LanguageConfig): LanguageConfig {
    if (data instanceof LanguageConfig) {
      return data;
    }

    const availableLanguages = this.availableLanguagesListMapper.mapToModel(data.availableLanguages);

    return new LanguageConfig({
      defaultLanguage: data.defaultLanguage,
      availableLanguages
    } as LanguageConfig);
  }
}
