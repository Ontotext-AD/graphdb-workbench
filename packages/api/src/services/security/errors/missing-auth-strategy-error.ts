import {ErrorBase} from '../../../error';

/**
 * Error thrown when an authentication strategy has not been set.
 */
export class MissingAuthStrategyError extends ErrorBase {
  constructor() {
    super('Authentication strategy not set');
  }
}
