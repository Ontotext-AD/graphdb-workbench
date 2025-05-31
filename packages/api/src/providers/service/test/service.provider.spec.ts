import {ServiceProvider} from '../service.provider';
import {RepositoryService} from '../../../services/repository';
import {Service} from '../service';
import {LifecycleHooks} from '../lifecycle-hooks';

class DummyService implements Service {}
class BaseService implements Service {}
class DerivedService extends BaseService {}
class AnotherService implements Service, LifecycleHooks {
  public static wasCreated  = false;
  onCreated(): void {
    AnotherService.wasCreated = true;
  }
}

describe('ServiceProvider', () => {
  beforeEach(() => {
    // Clear internal map before each test to avoid leaks
    ServiceProvider['SERVICE_INSTANCES'].clear();
    AnotherService.wasCreated = false;
  });

  test('get should return singleton instance of service', () => {
    // Given:
    // I have an instance of a service fetched by ServiceProvider
    const firstRepositoryServiceInstance = ServiceProvider.get(RepositoryService);
    // When I fetch another instance of same service
    const secondRepositoryServiceInstance = ServiceProvider.get(RepositoryService);
    // Then I expect the second instance to be the same reference as the first one.
    expect(firstRepositoryServiceInstance).toBe(secondRepositoryServiceInstance);
  });

  test('get should return singleton instance of a service', () => {
    const instance1 = ServiceProvider.get(DummyService);
    const instance2 = ServiceProvider.get(DummyService);
    expect(instance1).toBe(instance2);
  });

  test('get should call onCreated() on LifecycleHooks service', () => {
    const instance = ServiceProvider.get(AnotherService);
    expect(instance).toBeInstanceOf(AnotherService);
    expect(AnotherService.wasCreated).toBe(true);
  });

  test('getAllBySuperType should return all services that inherit from a given base class', () => {
    ServiceProvider.get(DummyService);
    ServiceProvider.get(DerivedService);
    const services = ServiceProvider.getAllBySuperType(BaseService);
    expect(services.length).toBe(1);
    expect(services[0]).toBeInstanceOf(DerivedService);
  });

  test('getAllBySuperType should return empty array if no matches found', () => {
    ServiceProvider.get(DummyService);
    const services = ServiceProvider.getAllBySuperType(BaseService);
    expect(services).toEqual([]);
  });
});
