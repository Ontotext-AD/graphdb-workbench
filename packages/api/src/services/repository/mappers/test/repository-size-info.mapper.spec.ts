import {RepositorySizeInfo} from '../../../../models/repositories';
import {mapRepositorySizeInfoResponseToModel} from '../repository-size-info.mapper';

describe('RepositorySizeInfoMapper', () => {

  test('mapToModel should return an instance of RepositorySizeInfo', () => {
    const rawData = {
      inferred: 2,
      total: 3,
      explicit: 1
    };

    const repositorySizeInfo = mapRepositorySizeInfoResponseToModel(rawData);

    expect(repositorySizeInfo).toBeInstanceOf(RepositorySizeInfo);
    expect(repositorySizeInfo).toEqual(new RepositorySizeInfo(rawData));
  });
});
