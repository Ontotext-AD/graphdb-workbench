import {Service} from './service';

export class AuthenticationService implements Service {
    login(): string {
        return "Athentication.login from the API";
    }
}
