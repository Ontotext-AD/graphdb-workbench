import { ExtensionPointName } from '../extension-point-name';
import { ExtensionPoint } from '../extension-point';
import { Plugin } from '../../plugins/plugin';

/**
 * Extension point for application themes.
 * Plugins registered to this extension point can contribute custom themes that modify the look and feel of the application.
 *
 */
export class ThemesExtensionPoint extends ExtensionPoint<Plugin> {
  /**
   * The name of the extension point, used for registration and lookup.
   */
  name = ExtensionPointName.THEMES;
}
