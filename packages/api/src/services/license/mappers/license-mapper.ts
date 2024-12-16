import { Mapper } from '../../../providers/mapper/mapper';
import { License } from '../../../models/license';

/**
 * Mapper for Graph DB license object. Maps the API JSON response to {@link License}
 */
export class LicenseMapper extends Mapper<License> {

  /**
   * Map to {@link License} object
   *
   * @param {Partial<License>} data - The raw representation of the license object
   * @returns {License} - A new License instance
   */
  mapToModel(data: Partial<License>): License {
    return new License(data);
  }
}
