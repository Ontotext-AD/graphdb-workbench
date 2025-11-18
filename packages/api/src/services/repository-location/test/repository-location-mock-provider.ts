import {AuthenticationType} from '../../../models/security';
import {
  RepositoryLocation,
  RepositoryLocationResponse,
  RepositoryLocationType
} from '../../../models/repository-location';

export class RepositoryLocationMockProvider {
  static provideRepositoryLocation(uri: string): RepositoryLocation {
    const raw = RepositoryLocationMockProvider.provideRawRepositoryLocation(uri);

    return new RepositoryLocation({
      uri: raw.uri,
      label: raw.label,
      username: raw.username,
      password: raw.password,
      authType: raw.authType,
      locationType: raw.locationType,
      active: raw.active,
      local: raw.local,
      system: raw.system,
      errorMsg: raw.errorMsg,
      defaultRepository: raw.defaultRepository
    });
  }

  static provideRawRepositoryLocation(uri: string): RepositoryLocationResponse {
    return {
      uri,
      label: '',
      username: '',
      password: '',
      authType: AuthenticationType.NONE,
      locationType: RepositoryLocationType.GDB,
      active: true,
      local: true,
      system: false,
      errorMsg: '',
      defaultRepository: ''
    };
  }

}
