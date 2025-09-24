import {ErrorBase} from '../../error';

/**
 * Error thrown when attempting to access an extension point that has not been registered.
 */
export class ExtensionPointNotFoundError extends ErrorBase {
  /**
   * Creates a new instance of ExtensionPointNotFoundError.
   *
   * @param {string} extensionPointName - The name of the missing extension point.
   */
  constructor(extensionPointName: string) {
    super(`Extension point "${extensionPointName}" does not exist.`);
  }
}
