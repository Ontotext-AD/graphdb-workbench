import {
  registerApplication,
  addErrorHandler,
  getAppStatus,
  navigateToUrl,
  LifeCycles,
} from 'single-spa';
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from 'single-spa-layout';
import {bootstrapWorkbench} from './bootstrap/bootstrap';
import {
  ApplicationLifecycleContextService,
  ConfigurationContextService,
  EventService,
  getBasePath,
  NavigationEnd,
  NavigationStart,
  service,
  WindowService,
} from '@ontotext/workbench-api';
import './styles/onto-stylesheet.scss';
import './onto-vendor';
import './styles/main.scss';
import './styles/css/charteditor-custom.css';
import {RouteProvider} from './services/route-provider';
import {getWorkbenchRoutes} from './services/workbench-routes-provider';
import {getLegacyRoutes} from './services/legacy-routes-provider';
import {AppChangeEvent, AppModules, NavigationEvent, SingleSpaGlobal} from './models/models';

const SINGLE_SPA_GLOBAL_KEY = 'singleSpa';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    [SINGLE_SPA_GLOBAL_KEY]?: SingleSpaGlobal;
    __singleSpaRouterListenersRegistered?: boolean;
  }
}

// This is a so-called context map which is needed by webpack in order to be able
// to properly resolve the urls for the dynamic imports. Otherwise it wouldn't be
// able to load the modules.
const appModules: AppModules = {
  '@ontotext/legacy-workbench': () => import(/* webpackIgnore: true */ '@ontotext/legacy-workbench'),
  '@ontotext/workbench-api': () => import('@ontotext/workbench-api'),
  '@ontotext/root-config': () => import('@ontotext/root-config'),
  '@ontotext/workbench': () => import(/* webpackIgnore: true */ '@ontotext/workbench'),
};

function showSplashScreen(show: boolean): void {
  const splashScreenEl = document.getElementById('splash-screen');
  if (!splashScreenEl) {
    return;
  }
  if (show) {
    splashScreenEl.style.display = 'block';
    splashScreenEl.classList.add('splash-screen-fadein');
  } else {
    splashScreenEl.classList.remove('splash-screen-fadein');
    splashScreenEl.classList.add('splash-screen-fadeout');
    setTimeout(() => {
      splashScreenEl.style.display = 'none';
      splashScreenEl.classList.remove('splash-screen-fadeout');
    }, 300);
  }
}

function ensureGlobalNavigate(): void {
  const globalObj: SingleSpaGlobal = window[SINGLE_SPA_GLOBAL_KEY] || (window[SINGLE_SPA_GLOBAL_KEY] = {});
  if (!globalObj.navigateToUrl) {
    globalObj.navigateToUrl = navigateToUrl;
  }
}

function registerSingleSpaRouterListeners(): void {
  // Ensure we register the listeners only once
  if (window.__singleSpaRouterListenersRegistered) {
    return;
  }
  window.__singleSpaRouterListenersRegistered = true;

  WindowService.getWindow().addEventListener('single-spa:before-routing-event', (evt: Event) => {
    const d = (evt as NavigationEvent).detail;
    service(EventService).emit(new NavigationStart(d.oldUrl, d.newUrl, d.cancelNavigation));
  });

  WindowService.getWindow().addEventListener('single-spa:routing-event', (evt: Event) => {
    const d = (evt as NavigationEvent).detail;
    service(EventService).emit(new NavigationEnd(d.oldUrl, d.newUrl));
  });

  WindowService.getWindow().addEventListener('single-spa:before-app-change', (evt: Event) => {
    const d = (evt as AppChangeEvent).detail;
    service(ApplicationLifecycleContextService).updateApplicationStateBeforeChange(d.newAppStatuses);
  });

  WindowService.getWindow().addEventListener('single-spa:app-change', (evt: Event) => {
    const d = (evt as AppChangeEvent).detail;
    service(ApplicationLifecycleContextService).updateApplicationStateChange(d.newAppStatuses);
  });
}

function loadAppByName(name: string): Promise<LifeCycles | undefined> {
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
      return undefined;
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
      return undefined;
    });
}

function initSingleSpa(): void {
  const legacyRoutes = getLegacyRoutes();
  const workbenchRoutes = getWorkbenchRoutes();
  const layout = RouteProvider.getRoutesConfiguration(getBasePath(), legacyRoutes, workbenchRoutes);
  const routes = constructRoutes(layout);
  const applications = constructApplications({
    routes,
    loadApp({name}: {name: string}) {
      return loadAppByName(name) as any;
    },
  });

  const layoutEngine = constructLayoutEngine({routes, applications});
  applications.forEach(registerApplication);
  layoutEngine.activate();
  registerSingleSpaRouterListeners();

  addErrorHandler((err: any) => {
    console.error(err);
    console.error(err.appOrParcelName);
    console.error(getAppStatus(err.appOrParcelName));
  });
}

function setupFavicon(): void {
  const iconPath = service(ConfigurationContextService).getApplicationConfiguration().applicationFaviconPath;

  const faviconLink = document.createElement('link');
  faviconLink.rel = 'icon';
  faviconLink.type = 'image/png';
  faviconLink.href = iconPath;
  document.head.appendChild(faviconLink);

  // Set apple touch icon
  const appleTouchLink = document.createElement('link');
  appleTouchLink.rel = 'apple-touch-icon-precomposed';
  appleTouchLink.href = iconPath;
  document.head.appendChild(appleTouchLink);
}

async function start(): Promise<void> {
  try {
    showSplashScreen(true);
    initSingleSpa();
    await bootstrapWorkbench();
    showSplashScreen(false);
    setupFavicon();
  } catch (error) {
    console.error('Error during workbench bootstrap', error);
  }
}

start();
