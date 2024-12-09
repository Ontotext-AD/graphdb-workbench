import {Service} from '../../providers/service/service';
import {RepositoryLocation} from '../../models/repository-location';

export class RepositoryLocationRestService implements Service {
  getActiveRepositoryLocation(): Promise<RepositoryLocation> {
    // TODO: Implement a uniform method to add required headers and handle 401 errors by redirecting to the login page.
    return fetch('/rest/locations/active')
      .then((response) => response.json());
  }
}
