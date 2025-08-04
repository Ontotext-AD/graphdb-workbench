import {inject, provideAppInitializer} from '@angular/core';
import {provideTransloco, TranslocoService} from '@jsverse/transloco';
import {ServiceProvider, LanguageService, LanguageContextService, TranslationBundle} from '@ontotext/workbench-api';
import {environment} from '../../../environments/environment';

/**
 * Bootstrap provider for transloco.
 *
 * Listens for language bundle change and configures transloco with the new language.
 *
 * @param translocoService - The transloco service.
 * @returns A Promise that resolves when the transloco configuration is complete.
 */
const translocoInitializeProvider = provideAppInitializer(() => {
  const translocoService = inject(TranslocoService);
  const languageContextService = ServiceProvider.get(LanguageContextService);
  const languageService = ServiceProvider.get(LanguageService);

  return new Promise<void>((resolve) => {
    languageContextService.onLanguageBundleChanged((languageBundle?: TranslationBundle) => {
      if (languageBundle) {
        const languageCode = languageContextService.getSelectedLanguage() || languageService.getDefaultLanguage();
        translocoService.setTranslation(languageBundle, languageCode);
        translocoService.setActiveLang(languageCode);
      }
      resolve();
    });
  });
});

const translocoConfigProvider = provideTransloco({
  config: {
    availableLangs: ServiceProvider.get(LanguageService).getSupportedLanguages(),
    defaultLang: ServiceProvider.get(LanguageService).getDefaultLanguage(),
    reRenderOnLangChange: true,
    prodMode: environment.production,
  },
});

export const translocoBootstrapProviders = [translocoInitializeProvider, translocoConfigProvider];
