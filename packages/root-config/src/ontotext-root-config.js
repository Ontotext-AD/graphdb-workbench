import {
  registerApplication,
  start,
  addErrorHandler,
  getAppStatus,
  navigateToUrl
} from 'single-spa';
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from 'single-spa-layout';
import microfrontendLayout from './microfrontend-layout.html';
import './styles/onto-stylesheet.scss';
import './onto-vendor';
import './styles/main.scss';
import {defineCustomElements} from '../../shared-components/loader';
import {bootstrapPromises, settleAllPromises} from './bootstrap/bootstrap';
import {
  ServiceProvider,
  EventService,
  NavigationEnd,
  NavigationStart
} from '@ontotext/workbench-api';
import {repositoryBootstrap} from './bootstrap/repository/repository-bootstrap';

const showSplashScreen = (show) => {
  const splashScreen = document.getElementById('splash-screen');
  splashScreen.style.display = show ? 'block' : 'none';
};

showSplashScreen(true);

addErrorHandler((err) => {
  console.error(err);
  console.error(err.appOrParcelName);
  console.error(getAppStatus(err.appOrParcelName));
});

// This is a so-called context map which is needed by webpack in order to be able
// to properly resolve the urls for the dynamic imports. Otherwise it wouldn't be
// able to load the modules.
const appModules = {
  '@ontotext/legacy-workbench': () => import('@ontotext/legacy-workbench'),
  '@ontotext/workbench-api': () => import('@ontotext/workbench-api'),
  '@ontotext/root-config': () => import('@ontotext/root-config'),
  '@ontotext/workbench': () => import('@ontotext/workbench')
};

const routes = constructRoutes(microfrontendLayout);
const applications = constructApplications({
  routes,
  loadApp({name}) {
    window.singleSpa = window.singleSpa || {};
    // Expose navigateToUrl to the window object so that it can be used by the components in the shared-components
    // package without importing single-spa which causes troubles.
    window.singleSpa.navigateToUrl = navigateToUrl;

    if (appModules[name]) {
      if (!name.includes('.')) {
        return appModules[name]()
          .catch((e) => {
            console.error(`Failed to load module: ${name}`, e);
          });
      } else {
        // This allows us to load submodules exported in a namespace-like fashion. For example: "@ontotext/components.navbar".
        const [module, exported] = name.split('.', 2);
        return appModules[module]().then((module) => module[exported]).catch((e) => {
          console.error(`Failed to load module: ${name}`, e);
        });
      }
    }
  },
});

const layoutEngine = constructLayoutEngine({routes, applications});

applications.forEach(registerApplication);
layoutEngine.activate();

const registerSingleSpaRouterListeners = () => {
  if (!window.singleSingleSpaRouterListenersRegistered) {
    window.singleSingleSpaRouterListenersRegistered = true;
    window.addEventListener('single-spa:before-routing-event', (evt) => {
      ServiceProvider.get(EventService).emit(new NavigationStart(evt.detail.oldUrl, evt.detail.newUrl, evt.detail.cancelNavigation));
    });
    window.addEventListener('single-spa:routing-event', (evt) => {
      ServiceProvider.get(EventService).emit(new NavigationEnd(evt.detail.oldUrl, evt.detail.newUrl));
    });
  }
};

const bootstrapApplication = () => {
  settleAllPromises(repositoryBootstrap)
    .then(() => settleAllPromises(bootstrapPromises))
    .then((results) => {
      const rejected = results.filter(r => r.status === 'rejected');

      if (rejected.length > 0) {
        console.warn('Some bootstrap steps failed:', rejected.map(r => r.reason));
      } else {
        console.info('All bootstrap steps succeeded.');
      }

      defineCustomElements();
      return start();
    })
    .then(() => showSplashScreen(false))
    .catch((error) => {
      console.error('Could not load application data', error);
    });
};

registerSingleSpaRouterListeners();
bootstrapApplication();

// window.addEventListener("single-spa:routing-event", (evt) => {
//     console.log("single-spa finished mounting/unmounting applications!");
//     console.log(evt.detail.originalEvent); // PopStateEvent
//     console.log(evt.detail.newAppStatuses); // { app1: MOUNTED, app2: NOT_MOUNTED }
//     console.log(evt.detail.appsByNewStatus); // { MOUNTED: ['app1'], NOT_MOUNTED: ['app2'] }
//     console.log(evt.detail.totalAppChanges); // 2
// });
