import {languageBootstrap} from './language/language-bootstrap';
import {licenseBootstrap} from './license/license-bootstrap';
import {productInfoBootstrap} from './product-info/product-info-bootstrap';
import {autoCompleteBootstrap} from './autocomplete/autocomplete';
import {securityBootstrap} from './security/security-bootstrap';

export const bootstrapPromises = [
  ...languageBootstrap,
  ...licenseBootstrap,
  ...productInfoBootstrap,
  ...autoCompleteBootstrap,
  ...securityBootstrap,
];

export const settleAllPromises = (bootstrapPromises) => {
  return Promise.allSettled(bootstrapPromises.map((bootstrapFn) => bootstrapFn()));
};
