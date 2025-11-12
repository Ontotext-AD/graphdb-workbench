import { TranslocoTestingModule } from '@jsverse/transloco';
import EN_labels from '../assets/i18n/en.json';

/**
 * Stubs the Transloco provider with preloaded EN labels.
 */
export function provideTranslocoForTesting() {
  return TranslocoTestingModule.forRoot({
    langs: {
      en: EN_labels
    },
    translocoConfig: {
      availableLangs: ['en'],
      defaultLang: 'en'
    },
    preloadLangs: true
  });
}
