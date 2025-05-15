/**
 * Utility class for build-related functionality.
 */
export class BuildUtil {
  /**
   * Determines if the application is running in development mode.
   *
   * @returns {boolean} True if the application is in development mode, false otherwise.
   */
  static isDevMode(): boolean {
    return window.wbDevMode;
  }
}
