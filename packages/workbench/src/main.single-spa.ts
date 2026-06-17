import './../node_modules/zone.js';
import {enableProdMode, NgZone} from '@angular/core';
import {NavigationStart, Router} from '@angular/router';
import {provideSingleSpaPlatform, singleSpaAngular} from 'single-spa-angular';

import {environment} from './environments/environment';
import {bootstrapApplication, platformBrowser} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {appConfig} from './app/app.config';
import {singleSpaProps} from './single-spa/single-spa-props';
import {navigate, WindowService} from '@ontotext/workbench-api';

if (environment.production) {
  enableProdMode();
}

const lifecycles = singleSpaAngular({
  bootstrapFunction: async (singleSpaProperties) => {
    try {
      singleSpaProps.set(singleSpaProperties);
      const platformRef = platformBrowser(provideSingleSpaPlatform());
      // bootstrapApplication initializes the standalone root component and its dependencies.
      // It returns a Promise that resolves with an ApplicationRef instance.
      // single-spa-angular requires this ApplicationRef to manage mounting and unmounting.
      const ngModuleRef = await bootstrapApplication(AppComponent, appConfig, {platformRef});

      WindowService.getWindow().addEventListener('click', anchorClickListener);

      ngModuleRef.onDestroy(() => {
        WindowService.getWindow().removeEventListener('click', anchorClickListener);
      });

      return ngModuleRef;
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
  NgZone
});

// This click listener is added at the root level to intercept all clicks on anchor tags.
// This is needed to ensure that internal navigation in SingleSPA is triggered.
const anchorClickListener = (e: MouseEvent) => {
  // @ts-expect-error EventTarget lacks closest(); the actual runtime value is an Element
  const a = e.target?.closest('a');
  if (!a) {
    return;
  }
  if (a.origin !== location.origin) {
    // external
    return;
  }
  if (a.target && a.target !== '_self') {
    // _blank etc.
    return;
  }
  if (e.defaultPrevented || e.button !== 0) {
    // not a plain left-click
    return;
  }
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
    // open-in-new-tab intent
    return;
  }
  e.preventDefault();
  navigate(a.href);
};

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
