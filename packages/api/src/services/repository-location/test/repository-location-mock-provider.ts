import {AuthenticationType} from '../../../models/security';
import {RepositoryLocation, RepositoryLocationType} from '../../../models/repository-location';

export class RepositoryLocationMockProvider {
  static provideRepositoryLocation(uri: string) {
    return new RepositoryLocation(RepositoryLocationMockProvider.provideRawRepositoryLocation(uri));
  }

  static provideRawRepositoryLocation(uri: string) {
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
