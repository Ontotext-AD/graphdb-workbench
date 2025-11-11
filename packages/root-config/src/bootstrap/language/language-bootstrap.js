import {
  ServiceProvider,
  LanguageStorageService,
  LanguageService,
  LanguageContextService
} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';

const logger = LoggerProvider.logger;

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
  return languageService.getLanguageConfiguration()
    .then((config) => {
      if (config) {
        languageContextService.setLanguageConfig(config);
        const languageToSet = storedLanguage?.value ?? config.defaultLanguage;
        languageContextService.updateSelectedLanguage(languageToSet);
        return languageService.getLanguage(config.defaultLanguage);
      }
    })
    .then((defaultBundle) => {
      if (defaultBundle) {
        languageContextService.updateDefaultBundle(defaultBundle);
        // Set the default bundle as current initially.
        // If another one is selected, it will be updated in onLanguageChange
        languageContextService.updateLanguageBundle(defaultBundle);
      }
    })
    .catch((error) => logger.error('Could not load language configuration', error))
    .finally(() => onLanguageChange());
};

const onLanguageChange = () => {
  const languageContextService = ServiceProvider.get(LanguageContextService);
  languageContextService.onSelectedLanguageChanged((language) => {
    const currentBundleLanguage = languageContextService.getLanguageBundle()?.language;
    if (language && currentBundleLanguage !== language) {
      ServiceProvider.get(LanguageService).getLanguage(language)
        .then((bundle) => {
          if (bundle) {
            languageContextService.updateLanguageBundle(bundle);
          }
        })
        .catch((error) => logger.error('Could not load language', error));
    }
  });
  return Promise.resolve();
};

export const languageBootstrap = [loadLanguageConfig];
