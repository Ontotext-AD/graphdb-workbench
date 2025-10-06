import { Model } from '../../common';

/**
 * Represents a plugin in the application.
 */
export class Plugin extends Model<Plugin> {
  /**
   * Internal flag indicating whether the plugin is disabled.
   */
  private _disabled = false;

  /**
   * Dynamic properties for the plugin.
   */
  [key: string]: unknown;

  /**
   * Gets the disabled state of the plugin.
   */
  get disabled(): boolean {
    return this._disabled;
  }

  /**
   * Sets the disabled state of the plugin.
   * @param {boolean} value - `true` to disable the plugin, `false` to enable it.
   */
  set disabled(value: boolean) {
    this._disabled = value;
  }
}
