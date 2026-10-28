import {OpenIdError} from './openid-error';

export class MissingOpenIdEndSessionUrl extends OpenIdError {
  constructor() {
    super('OpenID end session endpoint is not configured. Configure oidcEndSessionEndpoint to log out from the OpenID provider, or set localLogoutOnly to true to log out from GraphDB only.');
  }
}
