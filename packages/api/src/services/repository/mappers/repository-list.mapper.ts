import { Mapper } from '../../../providers/mapper/mapper';
import { Repository, RepositoryList } from '../../../models/repositories';
import { RepositoryMapper } from './repository.mapper';
import {RepositoryListResponse, RepositoryResponse} from '../../../models/repositories/repository-response';
import { toObject, ensureArray } from '../../../providers/mapper/guards';

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
   * @param {unknown} data - The raw server response containing repositories grouped by location URLs.
   *               The structure is a record where keys are location URLs and values are arrays of repository data.
   * @returns A {@link RepositoryList} model containing all repositories as a flat list.
   */
  mapToModel(data: unknown): RepositoryList {
    if (data instanceof RepositoryList) {
      return data;
    }

    const src = toObject<RepositoryListResponse>(data);
    const repositories: Repository[] = [];

    Object.values(src).forEach(group => {
      ensureArray<RepositoryResponse>(group).forEach(repoData => {
        repositories.push(this.repositoryMapper.mapToModel(repoData));
      });
    });

    return new RepositoryList(repositories);
  }
}
