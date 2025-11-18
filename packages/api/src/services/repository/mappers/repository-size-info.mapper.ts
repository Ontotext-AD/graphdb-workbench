import {Mapper} from '../../../providers/mapper/mapper';
import {RepositorySizeInfo} from '../../../models/repositories';
import {RepositorySizeInfoResponse} from '../../../models/repositories/repository-size-info-response';

export class RepositorySizeInfoMapper extends Mapper<RepositorySizeInfo> {

  /**
   * Maps the raw data to an instance of the {@link RepositorySizeInfo} model.
   *
   * @param {RepositorySizeInfoResponse} data - The raw data to be transformed into a RepositorySizeInfo model.
   * @returns {RepositorySizeInfo} - A new RepositorySizeInfo instance.
   */
  mapToModel(data: RepositorySizeInfoResponse): RepositorySizeInfo {
    const init: Partial<RepositorySizeInfo> = {
      inferred: data.inferred,
      explicit: data.explicit,
      total: data.total,
    };

    return new RepositorySizeInfo(init);
  }
}
