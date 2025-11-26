import {RepositoryLocation} from '../../../models/repository-location';
import {Mapper} from '../../../providers/mapper/mapper';
import {RepositoryLocationResponse} from '../../../models/repository-location/repository-location-response';

/**
 * A class containing functions to map various server responses to specific repository location models.
 */
export class RepositoryLocationMapper extends Mapper<RepositoryLocation> {

  /**
   * Maps the raw data to an instance of the {@link RepositoryLocation} model.
   *
   * @param {RepositoryLocationResponse | RepositoryLocation} data - The raw data to be transformed into a RepositoryLocation model.
   * @returns {RepositoryLocation} - A new Repository instance.
   */
  mapToModel(data: RepositoryLocationResponse | RepositoryLocation): RepositoryLocation {
    if (data instanceof RepositoryLocation) {
      return data;
    }

    return new RepositoryLocation(data);
  }
}
