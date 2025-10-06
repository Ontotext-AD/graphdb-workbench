import { ExtensionPoint } from '../extension-point';
import { ExtensionPointName } from '../extension-point-name';
import { Plugin } from '../../plugins/plugin';

/**
 * Extension point for interactive guide plugins.
 *
 * Holds plugins related to the steps used in guides or tutorials within the application.
 */
export class InteractiveGuideExtensionPoint extends ExtensionPoint<Plugin> {
  /**
   * Name of the extension point, used for registration and lookup
   */
  name = ExtensionPointName.INTERACTIVE_GUIDE;

  /**
   * Field used to uniquely identify plugins within this extension point
   */
  fieldIdName = 'guideBlockName';
}
