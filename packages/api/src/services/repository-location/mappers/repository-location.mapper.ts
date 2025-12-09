import {RepositoryLocation} from '../../../models/repository-location';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * A class containing functions to map various server responses to specific repository location models.
 */
export const mapRepositoryLocationResponseToModel: MapperFn<Partial<RepositoryLocation>, RepositoryLocation> = (data) => {
  return new RepositoryLocation(data);
};
