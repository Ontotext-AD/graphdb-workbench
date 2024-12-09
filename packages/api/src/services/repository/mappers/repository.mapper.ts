import { Repository } from '../../../models/repositories';
import { Mapper } from '../../../providers/mapper/mapper';

/**
 * A class containing functions to map various server responses to specific repository models.
 */
export class RepositoryMapper extends Mapper<Repository> {

  /**
   * Maps the raw data to an instance of the {@link Repository} model.
   *
   * @param {Repository} data - The raw data to be transformed into a Repository model.
   * @returns {Repository} - A new Repository instance.
   */
  mapToModel(data: Partial<Repository>): Repository {
    return new Repository(data);
  }
}
