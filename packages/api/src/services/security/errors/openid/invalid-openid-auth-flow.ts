import {OpenIdError} from './openid-error';

export class InvalidOpenidAuthFlow extends OpenIdError {
  constructor(authFlow?: string) {
    super(`Invalid OpenID authentication flow: ${authFlow}`);
  }
}
