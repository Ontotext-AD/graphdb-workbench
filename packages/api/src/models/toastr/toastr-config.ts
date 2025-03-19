import {ToastrPosition} from './toastr-position';

/**
 * Configuration class for Toast notifications.
 * Provides settings to control the behavior of toast notifications.
 */
export class ToastrConfig {
  private static instance: ToastrConfig;
  /**
   * The duration in milliseconds for which the toast notification will be displayed.
   */
  timeout: number;

  /**
   * The position of the toast notifications on the screen.
   */
  position: ToastrPosition;

  private constructor(config: ToastrConfig) {
    this.timeout = config.timeout;
    this.position = config.position;
  }

  /**
   * Returns the default configuration for toast notifications.
   * @returns {ToastrConfig} The singleton instance of ToastrConfig with default settings
   */
  static getDefaultConfig(): ToastrConfig {
    if(!this.instance) {
      this.instance = new ToastrConfig({
        timeout: 5000,
        position: ToastrPosition.BOTTOM_RIGHT,
      });
    }
    return this.instance;
  }
}
