import {RepositoryLocation} from '../../../models/repository-location';
import {Mapper} from '../../../providers/mapper/mapper';

/**
 * A class containing functions to map various server responses to specific repository location models.
 */
export class RepositoryLocationMapper extends Mapper<RepositoryLocation> {

  /**
   * Maps the raw data to an instance of the {@link RepositoryLocation} model.
   *
   * @param {Partial<RepositoryLocation>} data - The raw data to be transformed into a RepositoryLocation model.
   * @returns {RepositoryLocation} - A new Repository instance.
   */
  mapToModel(data: Partial<RepositoryLocation>): RepositoryLocation {
    return new RepositoryLocation(data);
  }
}
