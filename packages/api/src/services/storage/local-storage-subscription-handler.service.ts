import {Service} from '../../providers/service/service';
import {StorageKey} from '../../models/storage';
import {ServiceProvider} from '../../providers';
import {ContextService} from '../context';

/**
 * Service that handles the storage change events and triggers the appropriate context property change handlers.
 */
export class LocalStorageSubscriptionHandlerService implements Service {

  /**
   * Handles the storage change event and triggers the appropriate context property change handlers.
   * @param event The storage change event.
   */
  handleStorageChange(event: StorageEvent): void {
    // Keys used to map properties in the local storage are in format 'storage.namespace.propertyName'.
    // The 'storage.' prefix is removed to get the namespace and property name.
    const withoutGlobalPrefix = event.key?.substring(StorageKey.GLOBAL_NAMESPACE.length + 1);
    let namespace = '';
    let contextPropertyKey = '';
    if (withoutGlobalPrefix) {
      // The namespace is the part of the key before the first '.'.
      namespace = withoutGlobalPrefix.substring(0, withoutGlobalPrefix.indexOf('.'));
      // The context property key is the part of the key after the first '.'.
      contextPropertyKey = withoutGlobalPrefix.substring(namespace.length + 1);
    }

    const handler = this.resolveHandler(namespace, contextPropertyKey);
    if (handler) {
      handler.updateContextProperty(contextPropertyKey, event.newValue);
    }
  }

  /**
   * Resolves the context property change handler for the given namespace and property name.
   * @param namespace The namespace of the context property change handler.
   * @param propertyName The property name of the context property change handler.
   */
  private resolveHandler(namespace: string, propertyName: string): ContextService<Record<string, unknown>> | undefined {
    if (!namespace) {
      // eslint-disable-next-line no-console
      console.warn('Namespace is required to resolve a context property change handler.');
      return;
    }
    const handler = ServiceProvider.getAllBySuperType(ContextService)
      .find((service) => {
        return service.canHandle(propertyName);
      });
    if (!handler) {
      // eslint-disable-next-line no-console
      console.warn(`No context property change handler found for namespace: ${namespace} and property: ${propertyName}`);
      return;
    }
    return handler as ContextService<Record<string, unknown>>;
  }
}
