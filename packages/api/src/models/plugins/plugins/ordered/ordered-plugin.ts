import { Plugin } from '../plugin';

/**
 * Represents a plugin with ordering and priority information.
 */
export class OrderedPlugin extends Plugin {
  /**
   * Internal order value for the plugin.
   */
  private _order = 0;

  /**
   * Internal priority value for the plugin.
   */
  private _priority = 0;

  /**
   * Gets the order of the plugin.
   */
  get order(): number {
    return this._order;
  }

  /**
   * Sets the order of the plugin.
   */
  set order(value: number) {
    this._order = value;
  }

  /**
   * Gets the priority of the plugin.
   */
  get priority(): number {
    return this._priority;
  }

  /**
   * Sets the priority of the plugin.
   */
  set priority(value: number) {
    this._priority = value;
  }
}
