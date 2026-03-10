import {Service} from '../../../providers/service/service';
import {RepositoryRestService} from './repository-rest.service';
import {Repository, RepositoryList, RepositorySizeInfo} from '../../../models/repositories';
import {service} from '../../../providers';
import {mapRepositorySizeInfoResponseToModel} from './mappers/repository-size-info.mapper';
import {mapRepositoryListResponseToModel} from './mappers/repository-list.mapper';
import {RepositoryContextService} from './repository-context.service';

/**
 * Service responsible for handling operations related to repositories domain.
 */
export class RepositoryService implements Service {
  private readonly GRAPHQL_REPO_AUTHORITY = 'GRAPHQL';
  private readonly repositoryRestService: RepositoryRestService;
  private readonly repositoryContextService: RepositoryContextService;

  constructor() {
    this.repositoryRestService = service(RepositoryRestService);
    this.repositoryContextService = service(RepositoryContextService);
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
   * Checks if the given repository is a system repository.
   * @param repository The repository to check.
   * @returns True if the repository is a system repository, false otherwise.
   */
  isSystemRepository(repository: Repository): boolean {
    return repository.id === 'SYSTEM';
  }

  /**
   * Checks if the currently active repository is of type Ontop.
   * @returns True if the active repository is of type Ontop, false otherwise.
   */
  isActiveRepoOntopType() {
    return this.repositoryContextService.getSelectedRepository()?.isOntop() ?? false;
  };

  /**
   * Generates the authority string for the current repository based on the provided action and repository ID.
   * @param action The action for which to generate the authority (e.g., 'READ', 'WRITE').
   * @param repositoryId The ID of the repository for which to generate the authority.
   * @returns The generated authority string for the current repository.
   */
  getCurrentGqlRepoAuthority(action: string, repositoryId: string): string {
    return `${this.getCurrentRepoAuthority(action, repositoryId)}:${this.GRAPHQL_REPO_AUTHORITY}`;
  }

  /**
   * Generates the authority string for all repositories based on the provided action.
   * @param action The action for which to generate the authority (e.g., 'READ', 'WRITE').
   * @returns The generated authority string for all repositories.
   */
  getOverallGqlRepoAuthority(action: string): string {
    return `${this.getOverallRepoAuthority(action)}:${this.GRAPHQL_REPO_AUTHORITY}`;
  }

  /**
   * Generates a location-specific identifier for the given repository. If the repository has a location, the identifier
   * is in the format "id@location". Otherwise, it is simply the repository ID.
   * @param repository The repository for which to generate the location-specific identifier.
   * @returns The location-specific identifier for the repository.
   */
  getLocationSpecificId(repository: Repository): string {
    return repository.location ? `${repository.id}@${repository.location}` : repository.id;
  }

  /**
   * Generates the authority string for a specific repository based on the provided action and repository ID.
   * @param action The action for which to generate the authority (e.g., 'READ', 'WRITE').
   * @param repositoryId The ID of the repository for which to generate the authority.
   * @returns The generated authority string for the specific repository.
   */
  getCurrentRepoAuthority(action: string, repositoryId: string): string {
    return `${action}_REPO_${repositoryId}`;
  }

  /**
   * Generates the authority string for all repositories based on the provided action. The authority string is in the format "ACTION_REPO_*".
   * @param action The action for which to generate the authority (e.g., 'READ', 'WRITE').
   * @returns The generated authority string for all repositories.
   */
  getOverallRepoAuthority(action: string): string {
    return `${action}_REPO_*`;
  }
}
