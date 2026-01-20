import {LoggerConfig} from '../logging/logger-config';

/**
 * Configurable constants.
 * This is a flat configuration, so downloaded partial configurations could be applied easily.
 */
export interface Configuration {
  /**
   * The path where the plugins manifest is stored.
   */
  pluginsManifestPath: string;

  /**
   * Logging configuration
   */
  loggerConfig: LoggerConfig

  /**
   * The paths to the application logo images for different themes.
   * The keys are theme names: "light" or "dark", and the values are the corresponding logo image paths.
   */
  applicationLogoPaths: Record<string, string>;

  /**
   * The path to the default application logo image.
   */
  applicationLogoPath: string;

  /**
   * The path to the application favicon image.
   */
  applicationFaviconPath: string;
}
