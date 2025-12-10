import {Repository, RepositoryState, RepositoryType} from '../../../models/repositories';
import {RepositoryResponse} from '../../../models/repositories/repository-response';

export class RepositoryMockProvider {

  static provideRepository(id: string, location = ''): Repository {
    const raw = RepositoryMockProvider.provideRawRepository(id, location);

    return new Repository({
      id: raw.id,
      title: raw.title ?? '',
      uri: raw.uri,
      externalUrl: raw.externalUrl ?? '',
      location: raw.location ?? '',
      sesameType: raw.sesameType,
      type: raw.type as RepositoryType,
      state: raw.state as RepositoryState,
      local: raw.local,
      readable: raw.readable,
      writable: raw.writable,
      unsupported: raw.unsupported,
    });
  }

  static provideRawRepository(id: string, location = ''): RepositoryResponse {
    return {
      id,
      location,
      title: 'repo-title',
      externalUrl: '',
      local: true,
      readable: true,
      sesameType: 'sesameType',
      state: RepositoryState.INACTIVE,
      type: RepositoryType.FEDX,
      unsupported: false,
      uri: 'uri',
      writable: true,
    };
  }
}
