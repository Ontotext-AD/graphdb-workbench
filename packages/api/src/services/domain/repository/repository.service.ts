import {Service} from '../../../providers/service/service';
import {RepositoryRestService} from './repository-rest.service';
import {Repository, RepositoryList, RepositorySizeInfo} from '../../../models/repositories';
import {service} from '../../../providers';
import {mapRepositorySizeInfoResponseToModel} from './mappers/repository-size-info.mapper';
import {mapRepositoryListResponseToModel} from './mappers/repository-list.mapper';
import {RepositoryContextService} from './repository-context.service';
import {AuthorizationService} from '../security';

/**
 * Service responsible for handling operations related to repositories domain.
 */
export class RepositoryService implements Service {
  private readonly repositoryRestService: RepositoryRestService;
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly authorizationService = service(AuthorizationService);

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
   * Retrieves a list of repositories that the user has write access to.
   *
   * @returns {RepositoryList} A list of repositories that the user can write to.
   */
  getWritableRepositories(): RepositoryList {
    return this.repositoryContextService.getRepositoryList().filterAsList(repository => {
      return !repository.isOntop() && this.authorizationService.canWriteRepo(repository);
    });
  }

  /**
   * Retrieves a list of repositories that the user has read access to, including those that are readable through
   * GraphQL permissions.
   *
   * @returns {RepositoryList} A list of repositories that the user can read.
   */
  getReadableRepositories(): RepositoryList {
    return this.repositoryContextService.getRepositoryList().filterAsList(repository =>
      this.authorizationService.canReadRepo(repository) || this.authorizationService.canReadGqlRepo(repository)
    );
  }

  /**
   * Retrieves a list of repositories that the user has access to, based on the specified parameters.
   * @param includeRemote - If true, includes remote repositories in the list; otherwise, only local repositories are included.
   * @param requireWriteAccess - If true, returns repositories that the user has write access to; if false, returns repositories that the user has read access to.
   * @returns A list of repositories that the user has access to, filtered based on the provided parameters.
   */
  getAccessibleRepositories(includeRemote = false, requireWriteAccess = true): RepositoryList {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let remoteLocationsFilter = (_repo: Repository) => true;
    if (!includeRemote) {
      remoteLocationsFilter = (repo) => repo.local;
    }
    if (requireWriteAccess) {
      return new RepositoryList(this.getWritableRepositories().filter(remoteLocationsFilter));
    } else {
      return new RepositoryList(this.getReadableRepositories().filter(remoteLocationsFilter));
    }
  }
}
