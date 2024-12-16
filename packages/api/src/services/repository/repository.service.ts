import {Service} from '../../providers/service/service';
import {RepositoryRestService} from './repository-rest.service';
import {Repository, RepositoryList} from '../../models/repositories';
import {RepositoryListMapper} from './mappers/repository-list.mapper';
import {MapperProvider, ServiceProvider} from '../../providers';
import {RepositorySizeInfo} from '../../models/repositories';
import {RepositorySizeInfoMapper} from './mappers/repository-size-info.mapper';
import {Mapper} from '../../providers/mapper/mapper';

/**
 * The RepositoryService class is responsible for fetching repository-related data from the backend
 * and mapping the responses to application models.
 */
export class RepositoryService implements Service {
  private repositoryRestService: RepositoryRestService;
  private repositoryListMapper: Mapper<RepositoryList>;
  private repositorySizeInfoMapper: Mapper<RepositorySizeInfo>;

  constructor() {
    this.repositoryRestService = ServiceProvider.get(RepositoryRestService);
    this.repositoryListMapper = MapperProvider.get(RepositoryListMapper);
    this.repositorySizeInfoMapper = MapperProvider.get(RepositorySizeInfoMapper);
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

  /**
   * Retrieves triple information for the specified <code>repository</code>.
   *
   * @param repository The repository for which to retrieve size information.
   * @returns A promise that resolves to a {@link RepositorySizeInfo} object containing the repository's triple details.
   */
  getRepositorySizeInfo(repository: Repository): Promise<RepositorySizeInfo> {
    return this.repositoryRestService.getRepositorySizeInfo(repository)
      .then(this.repositorySizeInfoMapper.mapToModel);
  }
}
