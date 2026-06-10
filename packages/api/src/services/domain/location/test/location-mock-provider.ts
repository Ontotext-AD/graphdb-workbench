import {Location, LocationType} from '../../../../models/location';
import {LocationAuthenticationType} from '../../../../models/location/location-authentication-type';

export class LocationMockProvider {
  static provideLocation(uri: string) {
    return new Location(LocationMockProvider.provideRawLocation(uri));
  }

  static provideRawLocation(uri: string) {
    return {
      uri,
      label: '',
      username: '',
      password: '',
      authType: LocationAuthenticationType.NONE,
      locationType: LocationType.GDB,
      active: true,
      local: true,
      system: false,
      errorMsg: '',
      defaultRepository: ''
    } as Location;
  }
}
