import {ErrorBase} from '../error-base';

/**
 * Error thrown when a class is not initializable.
 * e.g. when a class is meant to have only static methods.
 */
export class ClassNotInitializableError extends ErrorBase {
  constructor() {
    super('Class is not initializable');
  }
}
