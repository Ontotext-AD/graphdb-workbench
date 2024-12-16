import { CapabilityList } from '../../../models/license';
import { Mapper } from '../../../providers/mapper/mapper';
import { Capability } from '../../../models/license';

/**
 * Mapper class for converting an array of Capability objects to a CapabilityList model.
 * Extends the base Mapper class with CapabilityList as the target model type.
 */
export class CapabilityListMapper extends Mapper<CapabilityList> {
  /**
   * Maps an array of Capability objects to a CapabilityList model.
   * 
   * @param data - An array of Capability objects to be mapped.
   * @returns A new CapabilityList instance containing the provided Capability objects.
   */
  mapToModel(data: Capability[]): CapabilityList {
    return new CapabilityList(data);
  }
}
