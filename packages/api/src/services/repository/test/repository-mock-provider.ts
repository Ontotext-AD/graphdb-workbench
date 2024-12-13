import {Repository, RepositoryState, RepositoryType} from '../../../models/repositories';

export class RepositoryMockProvider {

  static provideRepository(id: string, location = '') {
    return new Repository(RepositoryMockProvider.provideRawRepository(id, location));
  }

  static provideRawRepository(id: string, location = '') {
    return {
      id,
      location,
      title: 'repo-title',
      externalUrl: '',
      local: true,
      readable: true,
      sesameType: 'sesameType',
      state: RepositoryState.INACTIVE,
      type: RepositoryType.FEDEX,
      unsupported: false,
      uri: 'uri',
      writable: true,
    };
  }
}
