import {Location, LocationList, LocationType} from '../../../../models/location';
import {MapperFn} from '../../../../providers';
import {LocationListResponse, LocationResponse} from '../response/location-response';
import {toEnum} from '../../../utils';
import {LocationAuthenticationType} from '../../../../models/location/location-authentication-type';

export const mapLocationListResponseToModel: MapperFn<LocationListResponse, LocationList> = (data) => {
  if (Array.isArray(data)) {
    return new LocationList(data.map(mapLocationResponseToModel));
  }
  return new LocationList([]);
};

/**
 * A class containing functions to map various server responses to specific location models.
 */
export const mapLocationResponseToModel: MapperFn<LocationResponse, Location> = (data) => {
  return new Location({
    uri: data.uri,
    label: data.label,
    username: data.username ?? undefined,
    password: data.password ?? undefined,
    authType: data.authType ? toEnum(LocationAuthenticationType, data.authType) : LocationAuthenticationType.NONE,
    locationType: data.locationType ? toEnum(LocationType, data.locationType) : LocationType.GDB,
    active: data.active,
    local: data.local,
    system: data.system,
    errorMsg: data.errorMsg ?? undefined,
    defaultRepository: data.defaultRepository ?? undefined,
  });
};
