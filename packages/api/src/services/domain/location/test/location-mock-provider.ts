import {AuthenticationType} from '../../../../models/security';
import {Location, LocationType} from '../../../../models/location';

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
      authType: AuthenticationType.NONE,
      locationType: LocationType.GDB,
      active: true,
      local: true,
      system: false,
      errorMsg: '',
      defaultRepository: ''
    } as Location;
  }
}
