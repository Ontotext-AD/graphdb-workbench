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
import {
  ServiceProvider,
  LicenseService,
  LicenseContextService,
  TranslationService,
  ProductInfoService,
  ProductInfoContextService,
  RepositoryService,
  RepositoryContextService,
  LanguageService,
  LanguageContextService,
  LanguageStorageService
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

// TODO Branch includes three possible solutions and where I found them. Some of them don't seem to work with the current setup.
// TODO All commented solutions for the Splash screen need to be tested with the correct path of the image.
// TODO The timing of the Loader appearance and removal need to be verified, to see if appropriate.

// Setup as per documentation page: https://single-spa.js.org/docs/layout-definition/#loading-uis
const globalLoaderHTML = `
  <div id="loading-div" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(255, 255, 255, 0.8); display: flex; justify-content: center; align-items: center; z-index: 9999;">
    <div>Loading Workbench. Splash screen to replace this.</div>
    <img src="./img/graphdb-splash.svg" alt="Loading..." style="width: auto; height: auto;" />
  </div>`;

//Setup as per documentation page: https://single-spa.js.org/docs/layout-definition/#loading-uis
const data = {
  loaders: {
    globalLoader: globalLoaderHTML,
  },
};
//Setup as per documentation page: https://single-spa.js.org/docs/layout-definition/#loading-uis
const routes = constructRoutes(microfrontendLayout, data);
console.log(routes); // Loaders correctly recognized in the constructed routes

const applications = constructApplications({
  routes,
  loadApp({name}) {
    window.singleSpa = window.singleSpa || {};
    // Expose navigateToUrl to the window object so that it can be used by the components in the shared-components
    // package without importing single-spa which causes troubles.
    window.singleSpa.navigateToUrl = navigateToUrl;
    // Alternative solution (Option 2) from https://stackoverflow.com/questions/61471938/is-there-any-way-to-show-a-loader-till-micro-apps-getting-loaded-in-single-spa-p
    //showLoader().then(() => console.log('Resolved loader'));
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

/*// Alternative possible solution (registering Loader as an app), inspired by https://github.com/frehner/singlespa-transitions/blob/master/index.js
const loadingFunction = () =>
  import('./loader/loader.js').then((module) => ({
    bootstrap: module.bootstrap,
    mount: module.mount,
    unmount: module.unmount,
  }));

const activityFunction = (location) => {
  return !location.pathname.startsWith('/');
};
registerApplication('splashScreen', loadingFunction, activityFunction);*/
applications.forEach(registerApplication);
layoutEngine.activate();

defineCustomElements();

// Alternative solution (Option 2) from answer https://stackoverflow.com/questions/61471938/is-there-any-way-to-show-a-loader-till-micro-apps-getting-loaded-in-single-spa-p
const showLoader = () => {
  return new Promise((resolve) => {
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
    loaderImage.src = './img/graphdb-splash.svg';
    loaderImage.alt = 'Loading...';
    loaderImage.style.width = 'auto';
    loaderImage.style.height = 'auto';

    loadingDiv.appendChild(loaderImage);
    document.body.appendChild(loadingDiv);
    resolve();
  });
};

// Alternative solution (Option 2) from answer https://stackoverflow.com/questions/61471938/is-there-any-way-to-show-a-loader-till-micro-apps-getting-loaded-in-single-spa-p
const hideLoader = () => {
  const loadingDiv = document.getElementById('loading-div');
  if (loadingDiv) {
    loadingDiv.remove();
  }
};

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

const loadRepositories = () => {
  return ServiceProvider.get(RepositoryService).getRepositories()
    .then((repositories) => {
      ServiceProvider.get(RepositoryContextService).updateRepositoryList(repositories);
    })
    .catch((error) => {
      throw new Error('Could not load repositories', error);
    });
};

const loadProductInfoLocal = () => {
  return ServiceProvider.get(ProductInfoService).getProductInfoLocal()
    .then((productInfo) => {
      ServiceProvider.get(ProductInfoContextService).updateProductInfo(productInfo);
    })
    .catch((error) => {
      throw new Error('Could not load local product info', error);
    });
};

const loadLicense = () => {
  const licenseContext = ServiceProvider.get(LicenseContextService);
  return ServiceProvider.get(LicenseService).getLicense()
    .then((license) => {
      licenseContext.updateGraphdbLicense(license);
    })
    .catch(() => {
      licenseContext.updateGraphdbLicense({
        message: ServiceProvider.get(TranslationService).translate('license_alert.no_license_set'),
        valid: false
      });
    });
};

/**
 * Loads the language configuration
 *
 * When loaded, sets the config in the context. Then it checks if the default language from the config
 * is the same as the one stored in the local store. If so, the default bundle is emitted. If they
 * are different, the one from the local store is loaded. This way we ensure only one request for language
 * bundle is made upon initialization.
 *
 * @returns {Promise<void | void>} The resolved promise, when the config is loaded
 */
const loadLanguageConfig = () => {
  const languageService = ServiceProvider.get(LanguageService);
  const languageContextService = ServiceProvider.get(LanguageContextService);
  const storedLanguage = ServiceProvider.get(LanguageStorageService).get(languageContextService.SELECTED_LANGUAGE);
  let isStoredAndDefaultLangEqual = false;
  return languageService.getLanguageConfiguration()
    .then((config) => {
      if (config) {
        languageContextService.setLanguageConfig(config);
        isStoredAndDefaultLangEqual = storedLanguage && storedLanguage.value === config.defaultLanguage;
        if (!isStoredAndDefaultLangEqual) {
          // Update the selected language to the local store one
          languageContextService.updateSelectedLanguage(storedLanguage.value);
        }
        return languageService.getLanguage(config.defaultLanguage);
      }
    })
    .then((defaultBundle) => {
      if (defaultBundle) {
        languageContextService.updateDefaultBundle(defaultBundle);
        if (isStoredAndDefaultLangEqual) {
          languageContextService.updateLanguageBundle(defaultBundle);
        }
      }
    })
    .catch((error) => console.error('Could not load language configuration', error));
};

const onLanguageChange = () => {
  const languageContextService = ServiceProvider.get(LanguageContextService);
  return languageContextService.onSelectedLanguageChanged((language) => {
    if (language) {
      ServiceProvider.get(LanguageService).getLanguage(language)
        .then((bundle) => {
          if (bundle) {
            languageContextService.updateLanguageBundle(bundle);
          }
        })
        .catch((error) => console.error('Could not load language', error));
    }
  });
};

const registerSingleSpaFirstMountListener = () => {
  // register listener only if it's not already registered
  if (!window.singleSpaFirstMountListenerRegistered) {
    window.singleSpaFirstMountListenerRegistered = true;
    window.addEventListener('single-spa:first-mount', () => {
      initializeNavbar();
      // TODO: these are mandatory to be loaded before the application starts
      Promise.all(
        [
          loadLicense(),
          loadProductInfoLocal(),
          loadRepositories(),
          loadLanguageConfig(),
          onLanguageChange()
        ]
      )
        .then(() => {
          // eslint-disable-next-line no-console
          console.log('Application data loaded. Ready to start the application.');
          // Alternative solution (Option 2) from answer https://stackoverflow.com/questions/61471938/is-there-any-way-to-show-a-loader-till-micro-apps-getting-loaded-in-single-spa-p
          // hideLoader();
        })
        .catch((error) => {
          console.error('Could not load application data', error);
        });
    });
  }
};
registerSingleSpaFirstMountListener();

// window.addEventListener("single-spa:routing-event", (evt) => {
//     console.log("single-spa finished mounting/unmounting applications!");
//     console.log(evt.detail.originalEvent); // PopStateEvent
//     console.log(evt.detail.newAppStatuses); // { app1: MOUNTED, app2: NOT_MOUNTED }
//     console.log(evt.detail.appsByNewStatus); // { MOUNTED: ['app1'], NOT_MOUNTED: ['app2'] }
//     console.log(evt.detail.totalAppChanges); // 2
// });

start();
