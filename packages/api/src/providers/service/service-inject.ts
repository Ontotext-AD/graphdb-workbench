import {ServiceProvider} from './service.provider';
import {Service} from './service';

/**
 * Injects a service instance of the specified class retrieving the service instance from the ServiceProvider.
 * @param serviceClass The class of the service to inject.
 * @returns An instance of the specified service class.
 * @template T The type of the service to inject.
 * @example
 * ```typescript
 * import {service} from 'path/to/service-inject';
 * import {MyService} from 'path/to/my-service';
 * const myService = service(MyService);
 * ```
 */
export function service<T extends Service>(serviceClass: new (...args: never[]) => T): T {
  return ServiceProvider.get(serviceClass);
}
