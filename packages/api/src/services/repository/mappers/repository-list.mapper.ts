import {Repository, RepositoryList, RepositoryState, RepositoryType} from '../../../models/repositories';
import {MapperFn} from '../../../providers/mapper/mapper-fn';
import {RepositoryListResponse} from '../response/repository-response';
import {toEnum} from '../../utils';

/**
 * Maps server response data to a {@link RepositoryList} model.
 *
 * This mapper processes repository data grouped by location into a flat list of {@link Repository}
 * instances wrapped in a {@link RepositoryList}.
 */
export const mapRepositoryListResponseToModel: MapperFn<RepositoryListResponse, RepositoryList> = (data) => {
  if (!data || typeof data !== 'object') {
    return new RepositoryList();
  }

  const repositories: Repository[] = [];

  Object.entries(data).forEach(([, repositoriesData]) => {
    if (Array.isArray(repositoriesData)) {
      repositoriesData.forEach((repositoryData) => {
        const repository = new Repository({
          id: repositoryData.id,
          title: repositoryData.title,
          type: toEnum(RepositoryType, repositoryData.type),
          sesameType: repositoryData.sesameType,
          uri: repositoryData.uri,
          externalUrl: repositoryData.externalUrl,
          location: repositoryData.location,
          state: toEnum(RepositoryState, repositoryData.state),
          local: repositoryData.local,
          readable: repositoryData.readable,
          writable: repositoryData.writable,
          unsupported: repositoryData.unsupported
        });
        repositories.push(repository);
      });
    }
  });

  return new RepositoryList(repositories);
};
