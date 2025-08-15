/**
 * An interface representing the application environment settings.
 */
export interface Environment {
  /**
   * The URL of the configuration file.
   */
  configUrl: string;

  [key: string]: unknown;
}
