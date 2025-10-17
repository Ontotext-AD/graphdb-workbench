import {ErrorBase} from '../../../error';

export class MissingTokenInHeader extends ErrorBase {
  constructor() {
    super('Missing token in authentication header');
  }
}
