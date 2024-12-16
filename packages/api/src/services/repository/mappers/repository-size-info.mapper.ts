import {Mapper} from '../../../providers/mapper/mapper';
import {RepositorySizeInfo} from '../../../models/repositories';

export class RepositorySizeInfoMapper extends Mapper<RepositorySizeInfo> {

  /**
   * Maps the raw data to an instance of the {@link RepositorySizeInfo} model.
   *
   * @returns {RepositorySizeInfo} - A new RepositorySizeInfo instance.
   */
  mapToModel(data: Partial<RepositorySizeInfo>): RepositorySizeInfo {
    return new RepositorySizeInfo(data);
  }
}
