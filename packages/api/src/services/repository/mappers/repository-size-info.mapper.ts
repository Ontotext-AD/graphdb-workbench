import {RepositorySizeInfo} from '../../../models/repositories';
import {MapperFn} from '../../../providers/mapper/mapper-fn';
import {RepositorySizeInfoResponse} from '../response/repository-info-response';

export const mapRepositorySizeInfoResponseToModel: MapperFn<RepositorySizeInfoResponse, RepositorySizeInfo> = (data) => {
  return new RepositorySizeInfo(data);
};
