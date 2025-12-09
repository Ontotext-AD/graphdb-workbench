import {RepositorySizeInfo} from '../../../models/repositories';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

export const mapRepositorySizeInfoResponseToModel: MapperFn<Partial<RepositorySizeInfo>, RepositorySizeInfo> = (data) => {
  return new RepositorySizeInfo(data);
};
