import {ErrorBase} from '../../../../error';

/**
 * Error thrown when the repository size value returned by the RDF4J server is not a number.
 */
export class UnexpectedRepositorySizeError extends ErrorBase {
  constructor(response: unknown) {
    super(`Unexpected repository size value: "${response}"`);
  }
}
