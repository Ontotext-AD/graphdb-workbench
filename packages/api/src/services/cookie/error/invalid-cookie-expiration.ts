import {ErrorBase} from '../../../error';

/**
 * Custom error class for handling invalid cookie expiration values.
 * This error is thrown when an invalid expiration value (e.g., Infinity, NaN) is provided for a cookie.
 */
export class InvalidCookieExpiration extends ErrorBase {
  constructor(message: string) {
    super(message);
  }
}
