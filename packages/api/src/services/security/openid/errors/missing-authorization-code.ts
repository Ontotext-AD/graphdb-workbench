import {OpenIdError} from './openid-error';

export class MissingAuthorizationCode extends OpenIdError {
  constructor() {
    super('Missing authorization code');
  }
}
