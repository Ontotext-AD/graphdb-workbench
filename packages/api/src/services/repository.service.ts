import {Service} from './service';

export class RepositoryService implements Service {
  getRepositories(): Promise<Response> {
    return fetch('http://localhost:9000/rest/repositories/all');
  }
}
