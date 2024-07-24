import {WorkbenchService} from './services/workbenchService';

/**
 * Service provider for all {@link WorkbenchService} instances.
 * This provider caches all workbench services created on demand, ensuring that all micro frontends share a single instance of each service.
 */
export class WorkbenchServiceProvider {

    /**
     * The static modifier ensures the map is the same for all ServiceProviders. Each micro-frontend will have its
     * own instance of {@see ServiceFactoryService}, but the map with instances will be shared.
     *
     * @private
     */
    private static readonly SERVICE_INSTANCES = new Map<string, WorkbenchService>

    public static get<T extends WorkbenchService>(type: { new(service: WorkbenchService): T; }): T {
        if (!WorkbenchServiceProvider.SERVICE_INSTANCES.has(type.name)) {
            WorkbenchServiceProvider.SERVICE_INSTANCES.set(type.name, new type(this));
        }
        return this.SERVICE_INSTANCES.get(type.name) as T;
    }
}
