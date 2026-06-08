import {Service} from '../../../providers/service/service';
import {RepositoryRestService} from './repository-rest.service';
import {Repository, RepositoryList, RepositoryReference, RepositorySizeInfo} from '../../../models/repositories';
import {service} from '../../../providers';
import {mapRepositorySizeInfoResponseToModel} from './mappers/repository-size-info.mapper';
import {mapRepositoryListResponseToModel} from './mappers/repository-list.mapper';

/**
 * Service responsible for handling operations related to repositories domain.
 */
export class RepositoryService implements Service {
  private readonly repositoryRestService: RepositoryRestService;

  constructor() {
    this.repositoryRestService = service(RepositoryRestService);
  }

  /**
   * Retrieves the list of repositories.
   *
   * @returns A promise that resolves to the list of repositories.
   */
  async getRepositories(): Promise<RepositoryList> {
    const response = await this.repositoryRestService.getRepositories();
    return mapRepositoryListResponseToModel(response);
  }

  /**
   * Retrieves triple information for the specified <code>repository</code>.
   *
   * @param repository The repository for which to retrieve size information.
   * @returns A promise that resolves to a {@link RepositorySizeInfo} object containing the repository's triple details.
   */
  async getRepositorySizeInfo(repository: Repository): Promise<RepositorySizeInfo> {
    const data = await this.repositoryRestService.getRepositorySizeInfo(repository);
    return mapRepositorySizeInfoResponseToModel(data);
  }

  /**
   * Deletes a repository from the specified location.
   *
   * @param repository The repository reference containing the repository identifier and location.
   * @returns A promise that resolves when the repository has been successfully deleted
   */
  async  deleteRepository(repository: RepositoryReference): Promise<void> {
    return await this.repositoryRestService.deleteRepository(repository);
  }

  /**
   * Schedules a restart of a repository at the specified location.
   *
   * @param repository The repository reference containing the repository identifier and location.
   * @returns A promise that resolves when the restart operation has been successfully scheduled.
   */
  async restartRepository(repository: RepositoryReference): Promise<void> {
    return this.repositoryRestService.restartRepository(repository);
  }
}
