import { AvailableLanguagesList } from '../../../models/language/available-languages-list';
import { Mapper } from '../../../providers/mapper/mapper';
import { AvailableLanguage } from '../../../models/language/available-language';
import {AvailableLanguageResponse} from './language-config-mapper';

/**
 * Mapper class for converting an array of AvailableLanguage objects to an AvailableLanguagesList model.
 */
export class AvailableLanguagesListMapper extends Mapper<AvailableLanguagesList> {
  /**
   * Maps an array of AvailableLanguage objects to an AvailableLanguagesList model.
   *
   * @param data - An array of AvailableLanguage objects to be mapped.
   * @returns A new AvailableLanguagesList instance containing the provided AvailableLanguage objects.
   */
  mapToModel(data: AvailableLanguageResponse[]): AvailableLanguagesList {
    const languages = data.map(item =>
      new AvailableLanguage({ key: item.key, name: item.name })
    );
    return new AvailableLanguagesList(languages);
  }
}
