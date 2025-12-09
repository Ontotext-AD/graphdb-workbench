import {Repository, RepositoryList} from '../../../models/repositories';
import {mapRepositoryResponseToModel} from './repository.mapper';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Maps server response data to a {@link RepositoryList} model.
 *
 * This mapper processes repository data grouped by location into a flat list of {@link Repository}
 * instances wrapped in a {@link RepositoryList}.
 */
export const mapRepositoryListResponseToModel: MapperFn<Record<string, unknown[]>, RepositoryList> = (data) => {
  if (!data || typeof data !== 'object') {
    return new RepositoryList();
  }

  const repositories: Repository[] = [];

  Object.entries(data).forEach(([, repositoriesData]) => {
    if (Array.isArray(repositoriesData)) {
      repositoriesData.forEach((repositoryData) => {
        const repository = mapRepositoryResponseToModel(repositoryData as Partial<Repository>);
        repositories.push(repository);
      });
    }
  });

  return new RepositoryList(repositories);
};
