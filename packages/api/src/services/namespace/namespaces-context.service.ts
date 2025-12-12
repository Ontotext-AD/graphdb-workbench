import {ContextService} from '../context';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {LifecycleHooks} from '../../providers/service/lifecycle-hooks';
import {NamespaceMap} from '../../models/namespace';

type NamespacesContextFields = {
  readonly NAMESPACES: string;
}

type NamespacesContextFieldParams = {
  readonly NAMESPACES: NamespaceMap;
}

/**
 * Service for managing namespaces context in the application.
 */
export class NamespacesContextService extends ContextService<NamespacesContextFields> implements DeriveContextServiceContract<NamespacesContextFields, NamespacesContextFieldParams>, LifecycleHooks {
  readonly NAMESPACES = 'namespaces';

  /**
   * Updates the namespaces in the context.
   *
   * @param namespaces - The new namespace map to be stored in the context
   */
  updateNamespaces(namespaces: NamespaceMap): void {
    this.updateContextProperty(this.NAMESPACES, namespaces);
  }

  /**
   * Subscribes to changes in the namespaces context.
   *
   * @param callbackFn - The callback function that will be invoked when namespaces change
   * @returns A function that can be called to unsubscribe from the changes
   */
  onNamespacesChanged(callbackFn: ValueChangeCallback<NamespaceMap | undefined>) {
    return this.subscribe(this.NAMESPACES, callbackFn);
  }
}
