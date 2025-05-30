/**
 * Interface for defining lifecycle hooks for {@link Service} instances.
 *
 * Classes implementing this interface can hook into specific lifecycle moments,
 * such as when the instance is created by the {@link ServiceProvider}.

 */
export interface LifecycleHooks {
  /**
   * Hook called immediately after the service instance is created and before it's cached.
   * Useful for registration or custom setup that requires the fully constructed object.
   *
   * Services may use the `onCreated` method to perform additional registrations,
   * for example registering themselves in context or event registries.
   *
   * @example
   * ```ts
   * import { ServiceProvider } from '../service.provider';
   * import { ContextSubscriptionManager } from '../../services/context/context-service-registry';
   *
   * class MyService implements Service, LifecycleHooks {
   *   onCreated(): void {
   *     // Perform some task when fully created
   *     foo();
   *   }
   * }
   * ```
   */
  onCreated?(): void;
}
