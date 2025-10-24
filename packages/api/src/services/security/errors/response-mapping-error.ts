import {ErrorBase} from '../../../error';

/**
 * Error thrown when there is an issue mapping a response from the server.
 * The message should indicate the specific mapping problem encountered.
 */
export class ResponseMappingError extends ErrorBase {
  constructor(message: string) {
    super(message);
  }
}
