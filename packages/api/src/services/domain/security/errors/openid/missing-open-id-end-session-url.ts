import {OpenIdError} from './openid-error';

export class MissingOpenIdEndSessionUrl extends OpenIdError {
  constructor() {
    super('OpenID end session endpoint is not configured');
  }
}
