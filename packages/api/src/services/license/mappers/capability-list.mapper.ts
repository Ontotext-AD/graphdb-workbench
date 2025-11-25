import { CapabilityList } from '../../../models/license';
import { Mapper } from '../../../providers/mapper/mapper';
import { Capability } from '../../../models/license';

export type CapabilityDto = Capability;

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
  mapToModel(data: CapabilityList | CapabilityDto[]): CapabilityList {
    if (data instanceof CapabilityList) {
      return data;
    }

    return new CapabilityList(data);
  }
}
