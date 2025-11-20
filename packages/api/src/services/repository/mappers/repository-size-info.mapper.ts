import {Mapper} from '../../../providers/mapper/mapper';
import {RepositorySizeInfo} from '../../../models/repositories';
import {RepositorySizeInfoResponse} from '../../../models/repositories/repository-size-info-response';
import {toObject} from '../../../providers/mapper/guards';

export class RepositorySizeInfoMapper extends Mapper<RepositorySizeInfo> {
  private static toNum(v: unknown): number {
    if (typeof v === 'number') {
      return v;
    }
    if (typeof v === 'string' && v.trim() !== '') {
      const parsed = Number(v);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * Maps the raw data to an instance of the {@link RepositorySizeInfo} model.
   *
   * @param {unknown} data - The raw data to be transformed into a RepositorySizeInfo model.
   * @returns {RepositorySizeInfo} - A new RepositorySizeInfo instance.
   */
  mapToModel(data: unknown): RepositorySizeInfo {
    if (data instanceof RepositorySizeInfo) {
      return data;
    }
    const src = toObject<RepositorySizeInfoResponse>(data);

    return new RepositorySizeInfo({
      inferred: RepositorySizeInfoMapper.toNum(src.inferred),
      explicit: RepositorySizeInfoMapper.toNum(src.explicit),
      total: RepositorySizeInfoMapper.toNum(src.total),
    });
  }
}
