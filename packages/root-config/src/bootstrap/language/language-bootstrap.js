import {
  ServiceProvider,
  LanguageStorageService,
  LanguageService,
  LanguageContextService
} from '@ontotext/workbench-api';

/**
 * Loads the language configuration
 *
 * When loaded, sets the config in the context. Then it checks if the default language from the config
 * is the same as the one stored in the local store. If so, the default bundle is emitted. If they
 * are different, the one from the local store is loaded. This way we ensure only one request for language
 * bundle is made upon initialization.
 *
 * @returns {Promise<void | void>} The resolved promise, when the config is loaded
 */
const loadLanguageConfig = () => {
  const languageService = ServiceProvider.get(LanguageService);
  const languageContextService = ServiceProvider.get(LanguageContextService);
  const storedLanguage = ServiceProvider.get(LanguageStorageService).get(languageContextService.SELECTED_LANGUAGE);
  let isStoredAndDefaultLangEqual = false;
  return languageService.getLanguageConfiguration()
    .then((config) => {
      if (config) {
        languageContextService.setLanguageConfig(config);
        isStoredAndDefaultLangEqual = storedLanguage && storedLanguage.value === config.defaultLanguage;
        if (!isStoredAndDefaultLangEqual) {
          // Update the selected language to the local store one
          languageContextService.updateSelectedLanguage(storedLanguage.value);
        }
        return languageService.getLanguage(config.defaultLanguage);
      }
    })
    .then((defaultBundle) => {
      if (defaultBundle) {
        languageContextService.updateDefaultBundle(defaultBundle);
        if (isStoredAndDefaultLangEqual) {
          languageContextService.updateLanguageBundle(defaultBundle);
        }
      }
    })
    .catch((error) => console.error('Could not load language configuration', error));
};

const onLanguageChange = () => {
  const languageContextService = ServiceProvider.get(LanguageContextService);
  languageContextService.onSelectedLanguageChanged((language) => {
    if (language) {
      ServiceProvider.get(LanguageService).getLanguage(language)
        .then((bundle) => {
          if (bundle) {
            languageContextService.updateLanguageBundle(bundle);
          }
        })
        .catch((error) => console.error('Could not load language', error));
    }
  });
  return Promise.resolve();
};

export const languageBootstrap = [loadLanguageConfig, onLanguageChange];
