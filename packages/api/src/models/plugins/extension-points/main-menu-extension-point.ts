import { ExtensionPoint } from './extension-point';
import { Plugin } from '../plugins/plugin';

/**
 * Represents an extension point for the main menu of the application.
 * Plugins registered to this extension point are used for the creation of the main menu.
 */
export class MainMenuExtensionPoint extends ExtensionPoint<Plugin> {

  static readonly NAME = 'main.menu';
  /**
   * Name of the extension point, used for registration and lookup
   */
  name = MainMenuExtensionPoint.NAME;
}
