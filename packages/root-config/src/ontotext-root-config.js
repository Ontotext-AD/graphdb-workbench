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
import './styles/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import './styles/onto-stylesheet.css';
// import "./styles/bootstrap-graphdb-theme.css";
import {defineCustomElements} from '../../shared-components/loader';
import {bootstrapPromises} from './bootstrap/bootstrap';
import {
  ServiceProvider,
  EventService,
  NavigationEnd
} from '@ontotext/workbench-api';

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

// TODO The timing of the Loader appearance and removal need to be verified, to see if appropriate.

const showLoader = () => {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-div';
  loadingDiv.style.position = 'fixed';
  loadingDiv.style.top = '0';
  loadingDiv.style.left = '0';
  loadingDiv.style.width = '100%';
  loadingDiv.style.height = '100%';
  loadingDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  loadingDiv.style.display = 'flex';
  loadingDiv.style.justifyContent = 'center';
  loadingDiv.style.alignItems = 'center';
  loadingDiv.style.zIndex = '9999';

  const loaderImage = document.createElement('img');
  loaderImage.src = '/assets/graphdb-splash.svg';
  loaderImage.alt = 'Loading...';
  loaderImage.style.width = 'auto';
  loaderImage.style.height = 'auto';

  loadingDiv.appendChild(loaderImage);
  document.body.appendChild(loadingDiv);
};

const hideLoader = () => {
  const loadingDiv = document.getElementById('loading-div');
  if (loadingDiv) {
    loadingDiv.remove();
  }
};

showLoader();

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

defineCustomElements();

// This is a workaround to initialize the navbar when the root-config is loaded and the navbar is not yet initialized.
const waitForNavbarElement = () => {
  return new Promise((resolve, reject) => {
    const navbar = document.querySelector('onto-navbar');
    if (navbar) {
      resolve(navbar);
    } else {
      setTimeout(() => {
        waitForNavbarElement().then(resolve).catch(reject);
      }, 100);
    }
  });
};

const initializeNavbar = () => {
  waitForNavbarElement()
    .then((navbar) => {
      navbar.menuItems = PluginRegistry.get('main.menu');
    })
    .catch((e) => {
      console.error('onto-navbar element not found', e);
    });
};

const registerSingleSpaFirstMountListener = () => {
  // register listener only if it's not already registered
  if (!window.singleSpaFirstMountListenerRegistered) {
    window.singleSpaFirstMountListenerRegistered = true;
    window.addEventListener('single-spa:first-mount', () => {
      initializeNavbar();
    });
  }
};

const registerSingleSpaRouterListener = () => {
  if (!window.singleSingleSpaRouterListenerRegistered) {
    window.singleSingleSpaRouterListenerRegistered = true;
    window.addEventListener('single-spa:routing-event', (evt) => {
      ServiceProvider.get(EventService).emit(new NavigationEnd(evt.detail.oldUrl, evt.detail.newUrl));
    });
  }
};

const bootstrapApplication = () => {
  Promise.all(bootstrapPromises.map((bootstrapFn) => bootstrapFn()))
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('Application data loaded. Ready to start the application.');
      start();
      hideLoader();
    })
    .catch((error) => {
      console.error('Could not load application data', error);
    });
};

registerSingleSpaFirstMountListener();
registerSingleSpaRouterListener();
bootstrapApplication();

// window.addEventListener("single-spa:routing-event", (evt) => {
//     console.log("single-spa finished mounting/unmounting applications!");
//     console.log(evt.detail.originalEvent); // PopStateEvent
//     console.log(evt.detail.newAppStatuses); // { app1: MOUNTED, app2: NOT_MOUNTED }
//     console.log(evt.detail.appsByNewStatus); // { MOUNTED: ['app1'], NOT_MOUNTED: ['app2'] }
//     console.log(evt.detail.totalAppChanges); // 2
// });
