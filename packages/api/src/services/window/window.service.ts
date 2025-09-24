import {Service} from '../../providers/service/service';
import {PluginRegistry} from '../plugins';

/**
 * Service that provides access to browser window-related functionality.
 */
export class WindowService implements Service {

  /**
   * Returns the current browser window object. The purpose of this encapsulation is to allow for
   * better testability and easier mocking of the window object in unit tests.
   */
  static getWindow(): Window {
    return window;
  }

  static getPluginRegistry(): PluginRegistry {
    return WindowService.getWindow().PluginRegistry;
  }
}
