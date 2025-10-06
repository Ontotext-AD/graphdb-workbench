import { ExtensionPointName } from '../extension-point-name';
import { ExtensionPoint } from '../extension-point';
import { Plugin } from '../../plugins/plugin';

/**
 * Represents an extension point for the main menu of the application.
 * Plugins registered to this extension point are used for the creation of the main menu.
 */
export class MainMenuExtensionPoint extends ExtensionPoint<Plugin> {
  /**
   * Name of the extension point, used for registration and lookup
   */
  name = ExtensionPointName.MAIN_MENU;
}
