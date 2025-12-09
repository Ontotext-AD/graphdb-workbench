import {CapabilityList} from '../../../models/license';
import {Capability} from '../../../models/license';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

function toCapability(value: string): Capability | undefined {
  const match = Object.values(Capability).find((cap) => cap === value);
  return match ?? undefined;
}

/**
 * Mapper for converting an array of Capability objects to a CapabilityList model.
 */
export const mapCapabilityListToModel: MapperFn<string[], CapabilityList> = (data) => {
  const capabilities = (data ?? [])
    .map(toCapability)
    .filter((c): c is Capability => c !== undefined);
  return new CapabilityList(capabilities);
};

