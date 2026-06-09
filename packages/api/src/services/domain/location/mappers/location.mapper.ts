import {Location, LocationType} from '../../../../models/location';
import {MapperFn} from '../../../../providers';
import {LocationResponse} from '../response/location-response';
import {toEnum} from '../../../utils';
import {AuthenticationType} from '../../../../models/security';

/**
 * A class containing functions to map various server responses to specific location models.
 */
export const mapLocationResponseToModel: MapperFn<LocationResponse, Location> = (data) => {
  return new Location({
    uri: data.uri,
    label: data.label,
    username: data.username ?? undefined,
    password: data.password ?? undefined,
    authType: toEnum(AuthenticationType, data.authType),
    locationType: toEnum(LocationType, data.locationType),
    active: data.active,
    local: data.local,
    system: data.system,
    errorMsg: data.errorMsg ?? undefined,
    defaultRepository: data.defaultRepository ?? undefined,
  });
};
