import {languageBootstrap} from './language/language-bootstrap';
import {licenseBootstrap} from './license/license-bootstrap';
import {productInfoBootstrap} from './product-info/product-info-bootstrap';
import {autoCompleteBootstrap} from './autocomplete/autocomplete';
import {securityBootstrap} from './security/security-bootstrap';
import {repositoryBootstrap} from './repository/repository-bootstrap';

import {ServiceProvider, SecurityContextService, ApplicationLifecycleContextService, LifecycleState} from '@ontotext/workbench-api';
import {start} from 'single-spa';
import {defineCustomElements} from '../../../shared-components/loader';

const bootstrapPromises = [
  ...licenseBootstrap,
  ...productInfoBootstrap,
  ...autoCompleteBootstrap,
];

const settleAllPromises = (bootstrapPromises) => {
  return Promise.allSettled(bootstrapPromises.map((bootstrapFn) => bootstrapFn()));
};

const loadApplicationData = () => {
  return settleAllPromises(repositoryBootstrap)
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

export const bootstrapWorkbench = () => {
  return settleAllPromises(languageBootstrap)
    .then(() => securityBootstrap.loadSecurityConfig())
    .then(() => {
      securityBootstrap.subscribeToSecurityConfigChange();
      subscribeToAuthenticatedUserChange();
      defineCustomElements();
      return start();
    }).catch((error) => {
      console.error('Error during bootstrap of workbench', error);
    });
};
