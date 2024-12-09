import {Service} from '../../providers/service/service';

export class RepositoryRestService implements Service {
  getRepositories(): Promise<Record<string, unknown[]>> {
    // TODO: Implement a uniform method to add required headers and handle 401 errors by redirecting to the login page.
    return fetch('/rest/repositories/all')
      .then((response) => response.json());
  }
}
