import { ErrorBase } from '../../error';
import { ExtensionPoint, Plugin } from '../../models/plugins';

/**
 * Error thrown when attempting to register a plugin with the same order and priority as an existing one
 * within an ordered extension point.
 */
export class DuplicatePluginOrderError extends ErrorBase {
  /**
   * Creates a new instance of DuplicatePluginOrderError.
   *
   * @param {ExtensionPoint<Plugin>} extensionPoint - The extension point where the conflict occurred.
   * @param {number} order - The order value of the conflicting plugin.
   * @param {number} priority - The priority value of the conflicting plugin.
   */
  constructor(extensionPoint: ExtensionPoint<Plugin>, order: number, priority: number) {
    super(
      `There is already a plugin with the same order and priority. Extension point "${extensionPoint.name}", order "${order}", priority "${priority}".`
    );
  }
}
