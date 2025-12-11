import {AvailableLanguagesList, LanguageConfig} from '../../../models/language';
import {MapperFn} from '../../../providers/mapper/mapper-fn';
import {AvailableLanguageResponse, LanguageConfigResponse} from '../response/language-config-response';
import {AvailableLanguage} from '../../../models/language/available-language';

/**
 * Mapper class for LanguageConfig objects.
 */
export const mapLanguageConfigResponseToModel: MapperFn<LanguageConfigResponse, LanguageConfig> = (data) => {
  return new LanguageConfig({
    defaultLanguage: data.defaultLanguage,
    availableLanguages: mapAvailableLanguagesListToModel(data.availableLanguages)
  });
};

function mapAvailableLanguagesListToModel(data: AvailableLanguageResponse[]): AvailableLanguagesList {
  const languages = data.map((lang) => {
    return new AvailableLanguage(
      lang.key,
      lang.name
    );
  });
  return new AvailableLanguagesList(
    languages
  );
}
