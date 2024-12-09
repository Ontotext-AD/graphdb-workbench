import {Service} from '../../providers/service/service';
import {RepositoryRestService} from './repository-rest.service';
import {RepositoryList} from '../../models/repositories';
import {RepositoryListMapper} from './mappers/repository-list.mapper';
import {MapperProvider, ServiceProvider} from '../../providers';
import {Mapper} from '../../providers/mapper/mapper';

/**
 * The RepositoryService class is responsible for fetching repository-related data from the backend
 * and mapping the responses to application models.
 */
export class RepositoryService implements Service {
  private repositoryRestService: RepositoryRestService;
  private repositoryListMapper: Mapper<RepositoryList>;

  constructor() {
    this.repositoryRestService = ServiceProvider.get(RepositoryRestService);
    this.repositoryListMapper = MapperProvider.get(RepositoryListMapper);
  }

  /**
   * Retrieves the list of repositories.
   *
   * @returns A promise that resolves to the list of repositories.
   */
  getRepositories(): Promise<RepositoryList> {
    return this.repositoryRestService
      .getRepositories()
      .then((response) => {
        return this.repositoryListMapper.mapToModel(response);
      });
  }
}
