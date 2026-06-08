import {ErrorBase} from '../../../../error';

/**
 * Error thrown when the provided login data is invalid.
 */
export class InvalidLoginData extends ErrorBase {
  constructor() {
    super('Invalid login data. Expected an object of type LoginData.');
  }
}
