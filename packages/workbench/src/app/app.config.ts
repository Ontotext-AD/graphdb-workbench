import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {bootstrapProviders} from './bootstrap/bootstrap';
import {APP_BASE_HREF} from '@angular/common';
import {getSingleSpaExtraProviders} from 'single-spa-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    ...getSingleSpaExtraProviders(),
    ...bootstrapProviders,
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    {provide: APP_BASE_HREF, useValue: '/'}
  ]
};
