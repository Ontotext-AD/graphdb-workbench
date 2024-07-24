import {WorkbenchService} from './workbenchService';

export class WorkbenchRepositoryService implements WorkbenchService {
    getRepositories(): Promise<Response> {
        return fetch("http://localhost:9000/rest/repositories/all");
    }
}
