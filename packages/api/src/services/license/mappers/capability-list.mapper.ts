import { CapabilityList } from '../../../models/license';
import { Mapper } from '../../../providers/mapper/mapper';
import { Capability } from '../../../models/license';
import { ensureArray } from '../../../providers/mapper/guards';

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
  mapToModel(data: unknown): CapabilityList {
    if (data instanceof CapabilityList) {
      return data;
    }
    const capabilities = ensureArray<Capability>(data);
    return new CapabilityList(capabilities);
  }
}
