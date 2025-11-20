import { AvailableLanguagesList } from '../../../models/language/available-languages-list';
import { Mapper } from '../../../providers/mapper/mapper';
import { AvailableLanguage } from '../../../models/language/available-language';
import { ensureArray, toObject } from '../../../providers/mapper/guards';

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
  mapToModel(data: unknown): AvailableLanguagesList {
    if (data instanceof AvailableLanguagesList) {
      return data;
    }
    const rawItems = ensureArray<unknown>(data);
    const languages = rawItems.map(item => {
      if (item instanceof AvailableLanguage) {
        return item;
      }
      const src = toObject<AvailableLanguage>(item);
      return new AvailableLanguage({
        key: src.key ?? '',
        name: src.name ?? ''
      } as AvailableLanguage);
    });
    return new AvailableLanguagesList(languages);
  }
}
