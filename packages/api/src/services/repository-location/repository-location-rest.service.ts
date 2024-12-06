import {Service} from '../service';

export class RepositoryLocationRestService implements Service {
  getActiveRepositoryLocation(): Promise<Response> {
    // TODO: Implement a uniform method to add required headers and handle 401 errors by redirecting to the login page.
    return fetch('/rest/locations/active')
      .then((response) => response.json());
  }
}
