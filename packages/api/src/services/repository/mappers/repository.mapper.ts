import {Repository, RepositoryState, RepositoryType} from '../../../models/repositories';
import { Mapper } from '../../../providers/mapper/mapper';
import {RepositoryResponse} from '../../../models/repositories/repository-response';

/**
 * Maps a repository API response object to the domain `Repository` model.
 * Keeps mapping pure and applies domain defaults via the model constructor.
 */
export class RepositoryMapper extends Mapper<Repository> {

  /**
   * Maps the raw data to an instance of the {@link Repository} model.
   *
   * @param {Repository | RepositoryResponse} data - The raw data to be transformed into a Repository model.
   * @returns {Repository} - A new Repository instance.
   */
  mapToModel(data: RepositoryResponse): Repository {
    return new Repository({
      id: data.id,
      title: data.title ?? '',
      uri: data.uri,
      externalUrl: data.externalUrl ?? '',
      location: data.location ?? '',
      sesameType: data.sesameType,
      type: data.type as RepositoryType | undefined,
      state: data.state as RepositoryState | undefined,
      local: data.local,
      readable: data.readable,
      writable: data.writable,
      unsupported: data.unsupported
    });
  }
}
