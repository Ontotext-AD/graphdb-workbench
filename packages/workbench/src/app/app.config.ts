import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {getBasePath} from '@ontotext/workbench-api';

import {routes} from './app.routes';
import {bootstrapProviders} from './bootstrap/bootstrap';
import {APP_BASE_HREF} from '@angular/common';
import {provideSingleSpaPlatform} from 'single-spa-angular';
import {providePrimeNG} from 'primeng/config';
import {DialogService} from 'primeng/dynamicdialog';
import {ConfirmationService} from 'primeng/api';
import {provideTranslocoMessageformat} from '@jsverse/transloco-messageformat';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideSingleSpaPlatform(),
    ...bootstrapProviders,
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    {provide: APP_BASE_HREF, useValue: getBasePath()},
    // TODO: This is deprecated, but we can't change it until the primeng is updated to support the new API.
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'gw',
          // Wrap PrimeNG's own generated styles in a cascade layer so the
          // unlayered `:root` overrides from the styleguide always win,
          // regardless of stylesheet insertion order.
          cssLayer: {
            name: 'primeng',
            order: 'primeng',
          },
        }
      }
    }),
    DialogService,
    ConfirmationService,
    provideTranslocoMessageformat(),
  ]
};
