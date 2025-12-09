import {Repository} from '../../../models/repositories';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * A class containing functions to map various server responses to specific repository models.
 */
export const mapRepositoryResponseToModel: MapperFn<Partial<Repository>, Repository> = (data) => {
  return new Repository(data);
};
