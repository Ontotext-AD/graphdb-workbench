import {OpenIdError} from './openid-error';

export class UserHasNoAccess extends OpenIdError {
  constructor() {
    super('OpenID user has no access rights');
  }
}
