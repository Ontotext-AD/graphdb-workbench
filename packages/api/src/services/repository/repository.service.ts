import {Service} from '../service';
import {RepositoryRestService} from './repository-rest.service';
import {ServiceProvider} from '../../service.provider';
import {RepositoryList} from '../../models/repositories';
import {RepositoryMapper} from './repository.mapper';

/**
 * The RepositoryService class is responsible for fetching repository-related data from the backend
 * and mapping the responses to application models.
 */
export class RepositoryService implements Service {
  private repositoryRestService: RepositoryRestService;

  constructor() {
    this.repositoryRestService = ServiceProvider.get(RepositoryRestService);
  }

  /**
   * Retrieves the list of repositories.
   *
   * @returns A promise that resolves to the list of repositories.
   */
  getRepositories(): Promise<RepositoryList> {
    return this.repositoryRestService.getRepositories()
      .then((response) => RepositoryMapper.toRepositoryList(response));
  }
}
