import {languageBootstrap} from './language/language-bootstrap';
import {licenseBootstrap} from './license/license-bootstrap';
import {productInfoBootstrap} from './product-info/product-info-bootstrap';
import {repositoryBootstrap} from './repository/repository-bootstrap';
import {autoCompleteBootstrap} from './autocomplete/autocomplete';

export const bootstrapPromises = [
  ...languageBootstrap,
  ...licenseBootstrap,
  ...productInfoBootstrap,
  ...repositoryBootstrap,
  ...autoCompleteBootstrap
];
