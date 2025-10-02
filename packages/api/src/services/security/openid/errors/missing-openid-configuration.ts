import {OpenIdError} from './openid-error';

export class MissingOpenidConfiguration extends OpenIdError {
  constructor() {
    super('OpenID security configuration is not available');
  }
}
