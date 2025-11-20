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
import {bootstrapWorkbench} from './bootstrap/bootstrap';
import {
  service,
  EventService,
  NavigationEnd,
  NavigationStart,
  getBasePath
} from '@ontotext/workbench-api';
import microfrontendLayout from './microfrontend-layout.json';
import './styles/onto-stylesheet.scss';
import './onto-vendor';
import './styles/main.scss';
import './styles/css/charteditor-custom.css';

const SINGLE_SPA_GLOBAL_KEY = 'singleSpa';

// This is a so-called context map which is needed by webpack in order to be able
// to properly resolve the urls for the dynamic imports. Otherwise it wouldn't be
// able to load the modules.
const appModules = {
  '@ontotext/legacy-workbench': () => import('@ontotext/legacy-workbench'),
  '@ontotext/workbench-api': () => import('@ontotext/workbench-api'),
  '@ontotext/root-config': () => import('@ontotext/root-config'),
  '@ontotext/workbench': () => import('@ontotext/workbench')
};

function showSplashScreen(show) {
  const splashScreenEl = document.getElementById('splash-screen');
  if (splashScreenEl) {
    splashScreenEl.style.display = show ? 'block' : 'none';
  }
}

function ensureGlobalNavigate() {
  const globalObj = window[SINGLE_SPA_GLOBAL_KEY] || (window[SINGLE_SPA_GLOBAL_KEY] = {});
  if (!globalObj.navigateToUrl) {
    globalObj.navigateToUrl = navigateToUrl;
  }
}

function registerSingleSpaRouterListeners() {
  // Ensure we register the listeners only once
  if (window.__singleSpaRouterListenersRegistered) {
    return;
  }
  window.__singleSpaRouterListenersRegistered = true;

  window.addEventListener('single-spa:before-routing-event', (evt) => {
    const d = evt.detail;
    service(EventService).emit(new NavigationStart(d.oldUrl, d.newUrl, d.cancelNavigation));
  });

  window.addEventListener('single-spa:routing-event', (evt) => {
    const d = evt.detail;
    service(EventService).emit(new NavigationEnd(d.oldUrl, d.newUrl));
  });
}

function loadAppByName(name) {
  ensureGlobalNavigate();

  if (!name) {
    console.error('Empty application name requested.');
    return Promise.resolve(undefined);
  }

  const hasNamespace = name.includes('.');
  if (!hasNamespace) {
    const loader = appModules[name];
    if (!loader) {
      console.error(`No loader found for module: ${name}`);
      return Promise.resolve(undefined);
    }
    return loader().catch((e) => {
      console.error(`Failed to load module: ${name}`, e);
    });
  }

  // Namespaced: e.g. "@ontotext/components.navbar"
  const [rootName, exportName] = name.split('.', 2);
  const rootLoader = appModules[rootName];
  if (!rootLoader) {
    console.error(`No root loader found for namespaced module: ${name}`);
    return Promise.resolve(undefined);
  }
  return rootLoader()
    .then((mod) => {
      const exported = mod?.[exportName];
      if (!exported) {
        console.error(`Export "${exportName}" missing in module "${rootName}"`);
      }
      return exported;
    })
    .catch((e) => {
      console.error(`Failed to load namespaced module: ${name}`, e);
    });
}

function initSingleSpa() {
  // Makes the single spa router aware of reverse proxy context
  microfrontendLayout.base = getBasePath();
  const routes = constructRoutes(microfrontendLayout);
  const applications = constructApplications({
    routes,
    loadApp({name}) {
      return loadAppByName(name);
    },
  });

  const layoutEngine = constructLayoutEngine({routes, applications});
  applications.forEach(registerApplication);
  layoutEngine.activate();
  registerSingleSpaRouterListeners();

  addErrorHandler((err) => {
    console.error(err);
    console.error(err.appOrParcelName);
    console.error(getAppStatus(err.appOrParcelName));
  });
}

async function start() {
  try {
    showSplashScreen(true);
    initSingleSpa();
    await bootstrapWorkbench();
    showSplashScreen(false);
  } catch (error) {
    console.error('Error during workbench bootstrap', error);
  }
}

start();
