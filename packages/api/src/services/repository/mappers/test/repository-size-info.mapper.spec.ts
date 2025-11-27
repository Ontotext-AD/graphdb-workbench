import {RepositorySizeInfoMapper} from '../repository-size-info.mapper';
import {RepositorySizeInfo} from '../../../../models/repositories';
import {RepositorySizeInfoResponse} from '../../../../models/repositories/repository-size-info-response';

describe('RepositorySizeInfoMapper', () => {

  test('mapToModel should return an instance of RepositorySizeInfo', () => {
    const repositorySizeInfoMapper = new RepositorySizeInfoMapper();
    const rawData: RepositorySizeInfoResponse = {
      inferred: 2,
      total: 3,
      explicit: 1,
    };

    const repositorySizeInfo = repositorySizeInfoMapper.mapToModel(rawData);

    expect(repositorySizeInfo).toBeInstanceOf(RepositorySizeInfo);
    expect(repositorySizeInfo).toEqual(new RepositorySizeInfo(rawData));
  });
});
