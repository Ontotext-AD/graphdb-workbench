import {Service} from '../../providers/service/service';
import {Repository, RepositorySizeInfo} from '../../models/repositories';

export class RepositoryRestService implements Service {

  static readonly REPOSITORIES_ENDPOINT = 'rest/repositories';

  getRepositories(): Promise<Record<string, []>> {
    // TODO: Implement a uniform method to add required headers and handle 401 errors by redirecting to the login page.
    return fetch(`${RepositoryRestService.REPOSITORIES_ENDPOINT}/all`)
      .then((response) => response.json());
  }

  getRepositorySizeInfo(repository: Repository): Promise<RepositorySizeInfo> {
    return fetch(`${RepositoryRestService.REPOSITORIES_ENDPOINT}/${repository.id}/size?location=${encodeURIComponent(repository.location)}`)
      .then((response) => response.json());
  }
}
