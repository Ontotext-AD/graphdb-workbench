import {ServiceProvider} from './service.provider';
import {RepositoryService} from '../../services/repository';

describe('ServiceProvider', () => {

  test('Should return singleton instance of service', () => {
    // Given:
    // I have an instance of a service fetched by ServiceProvider
    const firstRepositoryServiceInstance = ServiceProvider.get(RepositoryService);
    // When I fetch another instance of same service
    const secondRepositoryServiceInstance = ServiceProvider.get(RepositoryService);
    // Then I expect the second instance to be the same reference as the first one.
    expect(firstRepositoryServiceInstance).toBe(secondRepositoryServiceInstance);
  });
});
