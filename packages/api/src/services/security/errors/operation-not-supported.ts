import {ErrorBase} from '../../../error';

/**
 * Error thrown when an operation/method is not supported.
 */
export class OperationNotSupported extends ErrorBase {
  constructor() {
    super();
  }
}
