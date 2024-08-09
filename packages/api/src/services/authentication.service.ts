import {Service} from './service';

export class AuthenticationService implements Service {
  login(): string {
    return 'Authentication.login from the API';
  }
}
