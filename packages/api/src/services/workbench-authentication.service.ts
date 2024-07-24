import {WorkbenchService} from './workbenchService';

export class WorkbenchAuthenticationService implements WorkbenchService {
    login(): string {
        return "Athentication.login from the API";
    }
}
