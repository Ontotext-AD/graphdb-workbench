import {languageBootstrap} from './language/language-bootstrap';
import {licenseBootstrap} from './license/license-bootstrap';
import {productInfoBootstrap} from './product-info/product-info-bootstrap';
import {autoCompleteBootstrap} from './autocomplete/autocomplete';
import {securityBootstrap} from './security/security-bootstrap';
import {repositoryBootstrap} from './repository/repository-bootstrap';
import {pluginsBootstrap} from './plugins/plugins-bootstrap';
import {bootstrapTheme} from './theme/theme-bootstrap';
import {configurationsBootstrap} from './configuration/configuration-bootstrap';
import {LoggerProvider} from '../services/logger-provider';

import {
  service,
  SecurityContextService,
  AuthorizationService,
  ApplicationLifecycleContextService,
  ApplicationSettingsStorageService,
  LifecycleState,
} from '@ontotext/workbench-api';
import {start} from 'single-spa';
import {defineCustomElements} from '../../../shared-components/loader';
import {registerInterceptors} from './interceptors/interceptors-registration';
import {runtimeConfigurationBootstrap} from './runtime-configuration/runtime-configuration';

const logger = LoggerProvider.logger;
let isInitialBootstrap = true;

const settleAllPromises = (bootstrapPromises) => {
  return Promise.allSettled(executePromises(bootstrapPromises));
};

/**
 * Executes all promises in parallel
 * @param bootstrapFns the bootstrap functions to execute
 * @returns an array with all called promises
 */
const executePromises = (bootstrapFns) => {
  return bootstrapFns.map((bootstrapFn) => bootstrapFn());
};

/**
 * Executes all promises, which are essential to be loaded prior to bootstrapping the workbench.
 */
const loadEssentials = () => {
  const essentialLoaders = executePromises([...licenseBootstrap, ...pluginsBootstrap, ...productInfoBootstrap, ...languageBootstrap]);
  return Promise.all([
    // Interceptors should be registered first to ensure all requests are intercepted before any backend calls are made.
    registerInterceptors(),
    // Await each bootstrap promise, not the array itself, otherwise promises wouldn't be awaited at all.
    ...essentialLoaders,
    runtimeConfigurationBootstrap(),
    securityBootstrap.loadSecurityConfig()
  ]);
};

const loadApplicationData = () => {
  const authenticatedUser = service(SecurityContextService).getAuthenticatedUser();
  if (!authenticatedUser) {
    // no need to load repositories and subsequent data if we don't have a user
    return Promise.resolve();
  }
  return settleAllPromises([...repositoryBootstrap])
    .then(() => settleAllPromises([...autoCompleteBootstrap]))
    .then((results) => {
      const rejected = results.filter(r => r.status === 'rejected');

      if (rejected.length > 0) {
        logger.warn('Some data could not be loaded', rejected.map(r => r.reason));
      } else {
        logger.info('Application data loaded');
        //  Notify listeners, all data has been loaded successfully and is available.
        service(ApplicationLifecycleContextService).updateApplicationDataState(LifecycleState.DATA_LOADED);
      }
    });
};

const loadApplicationConfigurations = () => {
  return configurationsBootstrap();
};

/**
 * Subscribes to authenticated user changes and reloads application data when the user changes (e.g. login with different
 * user). If a user is present, the permissions are updated. Since the initial bootstrap also loads application data,
 * we skip the first authenticated user change event in order not to duplicate requests.
 */
const subscribeToAuthenticatedUserChange = () => {
  const securityContextService = service(SecurityContextService);
  const authorizationService = service(AuthorizationService);
  const applicationLifecycleContextService = service(ApplicationLifecycleContextService);
  securityContextService.onAuthenticatedUserChanged((authenticatedUser) => {
    if (authenticatedUser) {
      authorizationService.updatePermissions();
      // Load data if it's not the initial bootstrap or if the application data state is not loaded yet
      // (when we are coming from the login page).
      const isDataLoaded = applicationLifecycleContextService.getApplicationDataState() === LifecycleState.DATA_LOADED;
      if (!isInitialBootstrap || !isDataLoaded) {
        loadApplicationData();
      }
      isInitialBootstrap = false;
    }
  });
};

/**
 * Migrates application settings stored in localStorage to the new format if needed.
 */
const migrateApplicationSettings = () => {
  const applicationSettingsStorageService = service(ApplicationSettingsStorageService);
  applicationSettingsStorageService.migrate();
};

/**
 * The main function to bootstrap the workbench.
 * Loads language bundles and security configuration and then proceeds to load single spa and sets up
 * subscriptions for config changes and authenticated user changes.
 */
export const bootstrapWorkbench = () => {
  // LocalStorage data migration steps.
  migrateApplicationSettings();
  // Initialize theme service and apply the preferred theme.
  bootstrapTheme();

  // Start by loading application configurations
  return loadApplicationConfigurations()
    .then(loadEssentials)
    .catch((error) => {
      // Only throw error if it's not a 401 Unauthorized error, as it's expected when the user is not authenticated.
      if (error.status !== 401) {
        throw error;
      }
    })
    .then(loadApplicationData)
    .then(() => {
      subscribeToAuthenticatedUserChange();
      defineCustomElements();
      return start();
    });
};
