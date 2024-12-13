import {MapperProvider} from './mapper.provider';
import {RepositoryListMapper} from '../../services/repository/mappers/repository-list.mapper';

describe('MapperProvider', () => {

  test('get should return singleton instance of mappers', () => {
    // Given:
    // I have an instance of a mapper fetched by MapperProvider
    const firstRepositoryListMapperInstance = MapperProvider.get(RepositoryListMapper);
    // When I fetch another instance
    const secondRepositoryListMapperInstance = MapperProvider.get(RepositoryListMapper);
    // Then I expect the second instance to be the same reference as the first one.
    expect(firstRepositoryListMapperInstance).toBe(secondRepositoryListMapperInstance);
  });
});
