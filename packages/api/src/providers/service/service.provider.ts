import {Service} from './service';
import {LifecycleHooks} from './lifecycle-hooks';

/**
 * Service provider for all {@link Service} instances. Services in the API are singletons, meaning that there is only
 * one instance of each service in the application. This provider caches all workbench services created on demand,
 * ensuring that all micro frontends share a single instance of each service.
 */
export class ServiceProvider {
  /**
     * The static modifier ensures the map is the same for all ServiceProviders. Each micro-frontend will have its
     * own instance of {@see ServiceFactoryService}, but the map with instances will be shared.
     */
  private static readonly SERVICE_INSTANCES = new Map<string, Service>;

  /**
   * Returns the instance of the given service type. If the service has not been created yet, this method:
   *   1. Instantiates the service via `new type()`.
   *   2. Calls its `onCreated()` hook if implemented.
   *   3. Caches and returns the instance.
   *
   * @param type The service type to retrieve.
   * @returns The instance of the service.
   * @template T The type of the service to retrieve.
   */
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  public static get<T extends Service>(type: { new (): T }): T {
    if (!ServiceProvider.SERVICE_INSTANCES.has(type.name)) {
      const instance = new type();
      if (ServiceProvider.implementsLifecycleHooks(instance)) {
        instance.onCreated?.();
      }
      ServiceProvider.SERVICE_INSTANCES.set(type.name, instance);
    }
    return this.SERVICE_INSTANCES.get(type.name) as T;
  }

  private static implementsLifecycleHooks(instance: Service): instance is LifecycleHooks {
    return typeof instance === 'object' && typeof (instance as LifecycleHooks).onCreated === 'function';
  }

  /**
   * Returns all instances of the given service type.
   * @param superType The super type of the services to retrieve.
   * @returns All instances of the given service type.
   * @template T The super type of the services to retrieve.
   */
  public static getAllBySuperType<T>(superType: abstract new(service: T) => T): T[] {
    return Array.from(ServiceProvider.SERVICE_INSTANCES.values())
      .filter((service) => service instanceof superType) as T[];
  }
}
