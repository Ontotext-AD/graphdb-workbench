import {ContextService} from '../context';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {DeniedPermissions} from '../../models/security';

type SecurityContextFields = {
  readonly HAS_PERMISSION: string
}

type SecurityContextFieldParams = {
  readonly HAS_PERMISSION: DeniedPermissions;
}

/**
 * The SecurityContextService class manages the various fields in the security context.
 */
export class SecurityContextService extends ContextService<SecurityContextFields> implements DeriveContextServiceContract<SecurityContextFields, SecurityContextFieldParams> {
  readonly HAS_PERMISSION = 'permission';

  getPermissions(): DeniedPermissions | undefined {
    return this.getContextPropertyValue(this.HAS_PERMISSION);
  }

  /**
   * Updates the user permission property.
   *
   * @param permissions the updated permission paths.
   */
  updateHasPermission(permissions: DeniedPermissions): void {
    this.updateContextProperty(this.HAS_PERMISSION, permissions);
  }

  /**
   * Registers the <code>callbackFunction</code> to be called whenever the permissions are changed.
   *
   * @param callbackFunction - The function to call when the permissions are changed.
   * @returns A function to unsubscribe from updates.
   */
  onUserPagePermissionChange(callbackFunction: ValueChangeCallback<DeniedPermissions | undefined>): () => void {
    return this.subscribe(this.HAS_PERMISSION, callbackFunction);
  }
}
