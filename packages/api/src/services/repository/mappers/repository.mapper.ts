import {Repository, RepositoryState, RepositoryType} from '../../../models/repositories';
import { Mapper } from '../../../providers/mapper/mapper';
import {RepositoryResponse} from '../../../models/repositories/repository-response';
import { toObject } from '../../../providers/mapper/guards';

/**
 * Maps a repository API response object to the domain `Repository` model.
 * Keeps mapping pure and applies domain defaults via the model constructor.
 */
export class RepositoryMapper extends Mapper<Repository> {

  /**
   * Maps the raw data to an instance of the {@link Repository} model.
   *
   * @param {unknown} data - The raw data to be transformed into a Repository model.
   * @returns {Repository} - A new Repository instance.
   */
  mapToModel(data: unknown): Repository {
    if (data instanceof Repository) {
      return data;
    }
    const src = toObject<RepositoryResponse>(data);
    return new Repository({
      id: src.id ?? '',
      title: src.title ?? '',
      uri: src.uri ?? '',
      externalUrl: src.externalUrl ?? '',
      location: src.location ?? '',
      sesameType: src.sesameType,
      type: src.type as RepositoryType | undefined,
      state: src.state as RepositoryState | undefined,
      local: src.local,
      readable: src.readable,
      writable: src.writable,
      unsupported: src.unsupported
    });
  }
}
