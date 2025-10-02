import {OpenIdError} from './openid-error';

export class InvalidJwtToken extends OpenIdError {
  constructor() {
    super('Invalid JWT token');
  }
}
