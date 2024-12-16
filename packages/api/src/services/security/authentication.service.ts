import {Service} from '../../providers/service/service';

export class AuthenticationService implements Service {
  login(): string {
    return 'Authentication.login from the API';
  }
}
