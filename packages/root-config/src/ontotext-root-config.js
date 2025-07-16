import {
  registerApplication,
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
// import 'shepherd.js/dist/css/shepherd.css';
import {bootstrapWorkbench} from './bootstrap/bootstrap';
import {
  ServiceProvider,
  EventService,
  NavigationEnd,
  NavigationStart
} from '@ontotext/workbench-api';
import {GuidesService} from './guides/guides.service';

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

registerSingleSpaRouterListeners();
bootstrapWorkbench()
  .then(() => {
    showSplashScreen(false);
    GuidesService.init();
  })
  .catch((error) => {
    console.error('Error during bootstrap of workbench', error);
  });

