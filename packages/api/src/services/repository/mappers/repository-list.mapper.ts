import { Mapper } from '../../../providers/mapper/mapper';
import { Repository, RepositoryList } from '../../../models/repositories';
import { RepositoryMapper } from './repository.mapper';

/**
 * Maps server response data to a {@link RepositoryList} model.
 *
 * This mapper processes repository data grouped by location into a flat list of {@link Repository}
 * instances wrapped in a {@link RepositoryList}.
 */
export class RepositoryListMapper extends Mapper<RepositoryList> {
  private readonly repositoryMapper: Mapper<Repository> = new RepositoryMapper();

  /**
   * Maps the raw data to an instance of the {@link RepositoryList} model.
   *
   * @param data - The raw server response containing repositories grouped by location URLs.
   *               The structure is a record where keys are location URLs and values are arrays of repository data.
   * @returns A {@link RepositoryList} model containing all repositories as a flat list.
   */
  mapToModel(data?: Record<string, unknown[]>): RepositoryList {
    if (!data || typeof data !== 'object') {
      return new RepositoryList();
    }

    const repositories: Repository[] = [];

    Object.entries(data).forEach(([, repositoriesData]) => {
      if (Array.isArray(repositoriesData)) {
        repositoriesData.forEach((repositoryData) => {
          const repository = this.repositoryMapper.mapToModel(repositoryData);
          repositories.push(repository);
        });
      }
    });

    return new RepositoryList(repositories);
  }
}
