import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {bootstrapProviders} from './bootstrap/bootstrap';
import {APP_BASE_HREF} from '@angular/common';
import {getSingleSpaExtraProviders} from 'single-spa-angular';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from "primeng/config";
import SandboxPreset from 'theme/sandbox-preset';

export const appConfig: ApplicationConfig = {
  providers: [
    ...getSingleSpaExtraProviders(),
    ...bootstrapProviders,
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    {provide: APP_BASE_HREF, useValue: '/'},
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: SandboxPreset,
        options: {
          darkModeSelector: false,
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, reset, primeng, tailwind-utilities'
          }
        }
      }
    }),
  ]
};
