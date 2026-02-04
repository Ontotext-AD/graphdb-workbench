import {Service} from '../../providers/service/service';
import {RepositoryRestService} from './repository-rest.service';
import {Repository, RepositoryList, RepositoryReference, RepositorySizeInfo} from '../../models/repositories';
import {ServiceProvider} from '../../providers';
import {mapRepositorySizeInfoResponseToModel} from './mappers/repository-size-info.mapper';
import {mapRepositoryListResponseToModel} from './mappers/repository-list.mapper';

/**
 * The RepositoryService class is responsible for fetching repository-related data from the backend
 * and mapping the responses to application models.
 */
export class RepositoryService implements Service {
  private readonly GRAPHQL_REPO_AUTHORITY = 'GRAPHQL';
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
    return this.repositoryRestService
      .getRepositories()
      .then((response) => {
        return mapRepositoryListResponseToModel(response);
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
      .then(mapRepositorySizeInfoResponseToModel);
  }

  isSystemRepository(repository: Repository): boolean {
    return repository.id === 'SYSTEM';
  }

  getCurrentGqlRepoAuthority(action: string, repoId: string): string {
    return `${this.getCurrentRepoAuthority(action, repoId)}:${this.GRAPHQL_REPO_AUTHORITY}`;
  }

  getOverallGqlRepoAuthority(action: string): string {
    return `${this.getOverallRepoAuthority(action)}:${this.GRAPHQL_REPO_AUTHORITY}`;
  }

  getLocationSpecificId(repo: Repository): string {
    return repo.location ? `${repo.id}@${repo.location}` : repo.id;
  }

  getCurrentRepoAuthority(action: string, repoId: string): string {
    return `${action}_REPO_${repoId}`;
  }

  getOverallRepoAuthority(action: string): string {
    return `${action}_REPO_*`;
  }

  /**
   * Parses a repository URL to extract the location and ID.
   * @param url The repository URL to parse.
   * @returns An object containing the location and ID of the repository.
   */
  parseRepositoryUrl(url: string): RepositoryReference {
    if (!url) {
      return {location: '', id: ''};
    }
    const regex = /^(https?:\/\/[^/]+)\/repositories\/([^/]+)/;
    const match = url.match(regex);

    if (match) {
      return {location: match[1], id: match[2]};
    }

    return {location: '', id: url};
  }

  /**
   * Generates a location-specific identifier for the given repository.
   * @param repository The repository for which to generate the identifier.
   * @returns The location-specific identifier as a string.
   */
  getRepositoryIdentifier(repository: Repository): string {
    return repository.getRepositoryIdentifier();
  }
}
