import './../node_modules/zone.js';
import {enableProdMode, NgZone} from '@angular/core';
import {NavigationStart, Router} from '@angular/router';
import {singleSpaAngular} from 'single-spa-angular';

import {environment} from './environments/environment';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {appConfig} from './app/app.config';

if (environment.production) {
  enableProdMode();
}

const lifecycles = singleSpaAngular({
  bootstrapFunction: async () => {
    try {
      // bootstrapApplication initializes the standalone root component and its dependencies.
      // It returns a Promise that resolves with an ApplicationRef instance.
      // single-spa-angular requires this ApplicationRef to manage mounting and unmounting.
      return await bootstrapApplication(AppComponent, appConfig);
    } catch (error) {
      // Log the detailed error for debugging purposes.
      console.error('Failed to bootstrap the Angular application:', error);
      // It's crucial to re-throw the error. This signals to single-spa
      // that the application has failed to load and should be put into a "broken" state.
      // Without this, single-spa might think the app loaded successfully, leading to unpredictable behavior.
      throw error;
    }
  },
  template: '<app-root />',
  Router,
  NavigationStart,
  NgZone,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
