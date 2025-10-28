import {ErrorBase} from '../../../error';

export class AuthenticationStrategyNotSet extends ErrorBase {
  constructor() {
    super('Authentication strategy not set');
  }
}
