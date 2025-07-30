import {languageBootstrap} from './language/language-bootstrap';
import {licenseBootstrap} from './license/license-bootstrap';
import {productInfoBootstrap} from './product-info/product-info-bootstrap';
import {autoCompleteBootstrap} from './autocomplete/autocomplete';
import {securityBootstrap} from './security/security-bootstrap';
import {repositoryBootstrap} from './repository/repository-bootstrap';
import {pluginsBootstrap} from './plugins/plugins-bootstrap';

import {
  ServiceProvider,
  SecurityContextService,
  ApplicationLifecycleContextService,
  LifecycleState
} from '@ontotext/workbench-api';
import {start} from 'single-spa';
import {defineCustomElements} from '../../../shared-components/loader';
import {pluginsBootstrap} from './plugins/plugins-bootstrap';

const bootstrapPromises = [
  ...licenseBootstrap,
  ...productInfoBootstrap,
  ...autoCompleteBootstrap,
];

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
  return Promise.all([
    executePromises([...pluginsBootstrap, ...languageBootstrap]),
    securityBootstrap.loadSecurityConfig()
  ]);
};

const loadApplicationData = () => {
  return settleAllPromises([...repositoryBootstrap])
    .then(() => settleAllPromises(bootstrapPromises))
    .then((results) => {
      const rejected = results.filter(r => r.status === 'rejected');

      if (rejected.length > 0) {
        console.warn('Some data could not be loaded', rejected.map(r => r.reason));
      } else {
        console.info('Application data loaded');
        //  Notify listeners, all data has been loaded successfully and is available.
        ServiceProvider.get(ApplicationLifecycleContextService).updateApplicationDataState(LifecycleState.DATA_LOADED);
      }
    });
};

const subscribeToAuthenticatedUserChange = () => {
  const securityContextService = ServiceProvider.get(SecurityContextService);
  securityContextService.onAuthenticatedUserChanged((authenticatedUser) => {
    if (authenticatedUser) {
      loadApplicationData();
    }
  });
};

/**
 * The main function to bootstrap the workbench.
 * Loads language bundles and security configuration and then proceeds to load single spa and sets up
 * subscriptions for config changes and authenticated user changes.
 */
export const bootstrapWorkbench = () => {
  return loadEssentials().catch((error) => {
    // Only throw error if it's not a 401 Unauthorized error, as it's expected when the user is not authenticated.
    if (error.status !== 401) {
      throw error;
    }
  }).then(() => {
    securityBootstrap.subscribeToSecurityConfigChange();
    subscribeToAuthenticatedUserChange();
    defineCustomElements();
    return start();
  });
};
