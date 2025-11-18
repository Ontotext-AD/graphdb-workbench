import { AvailableLanguagesList } from '../../../models/language/available-languages-list';
import { Mapper } from '../../../providers/mapper/mapper';
import { AvailableLanguage } from '../../../models/language/available-language';

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
  mapToModel(data?: AvailableLanguage[] | AvailableLanguagesList): AvailableLanguagesList {
    if (data instanceof AvailableLanguagesList) {
      return data;
    }
    return new AvailableLanguagesList(data ?? []);
  }
}
