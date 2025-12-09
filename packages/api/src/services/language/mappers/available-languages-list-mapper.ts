import {AvailableLanguagesList} from '../../../models/language/available-languages-list';
import {AvailableLanguage} from '../../../models/language/available-language';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Mapper class for converting an array of AvailableLanguage objects to an AvailableLanguagesList model.
 */
export const mapAvailableLanguagesListToModel: MapperFn<AvailableLanguage[], AvailableLanguagesList> = (data) => {
  return new AvailableLanguagesList(data);
};
