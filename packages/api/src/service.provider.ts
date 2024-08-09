import {Service} from './services/service';

/**
 * Service provider for all {@link Service} instances.
 * This provider caches all workbench services created on demand, ensuring that all micro frontends share a single instance of each service.
 */
export class ServiceProvider {

  /**
     * The static modifier ensures the map is the same for all ServiceProviders. Each micro-frontend will have its
     * own instance of {@see ServiceFactoryService}, but the map with instances will be shared.
     *
     * @private
     */
  private static readonly SERVICE_INSTANCES = new Map<string, Service>;

  public static get<T extends Service>(type: new(service: Service) => T): T {
    if (!ServiceProvider.SERVICE_INSTANCES.has(type.name)) {
      ServiceProvider.SERVICE_INSTANCES.set(type.name, new type(this));
    }
    return this.SERVICE_INSTANCES.get(type.name) as T;
  }
}
