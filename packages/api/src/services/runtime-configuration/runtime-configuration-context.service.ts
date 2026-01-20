import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {ContextService} from '../context';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {ThemeMode} from '../../models/application-settings';

export type RuntimeConfiguration = {
  isEmbedded: boolean;
}

type RuntimeConfigurationContextFields = {
  readonly RUNTIME_CONFIGURATION: string;
  readonly THEME_MODE: string;
}

type RuntimeConfigurationContextFieldParams = {
  readonly RUNTIME_CONFIGURATION: RuntimeConfiguration;
  readonly THEME_MODE: ThemeMode;
}

/**
 * Service for managing runtime configuration context within the application.
 */
export class RuntimeConfigurationContextService extends ContextService<RuntimeConfigurationContextFields> implements DeriveContextServiceContract<RuntimeConfigurationContextFields, RuntimeConfigurationContextFieldParams> {
  /**
   * Key used to store the runtime configuration in the context
   */
  readonly RUNTIME_CONFIGURATION = 'runtimeConfiguration';
  /**
   * Key used to store the theme mode in the context
   */
  readonly THEME_MODE = 'themeMode';

  /**
   * Updates the runtime configuration in the context.
   *
   * @param config - Partial runtime configuration to update
   */
  updateRuntimeConfiguration(config: Partial<RuntimeConfiguration>): void {
    const existingConfig = this.getRuntimeConfiguration() ?? {};
    const configuration = {
      ...existingConfig,
      ...config
    };
    this.updateContextProperty(this.RUNTIME_CONFIGURATION, configuration);
  }

  /**
   * Registers the <code>callbackFunction</code> to be called whenever the runtime configuration changes.
   *
   * @param callbackFunction - The function to call when the runtime configuration changes.
   * @returns A function to unsubscribe the callback
   */
  onRuntimeConfigurationChanged(callbackFunction: ValueChangeCallback<RuntimeConfiguration | undefined>): () => void {
    return this.subscribe(this.RUNTIME_CONFIGURATION, callbackFunction);
  }

  /**
   * Retrieves the current runtime configuration.
   *
   * @returns The current runtime configuration or undefined if not set
   */
  getRuntimeConfiguration(): RuntimeConfiguration | undefined {
    return this.getContextPropertyValue<RuntimeConfiguration>(this.RUNTIME_CONFIGURATION);
  }

  /**
   * Updates the theme mode in the context.
   *
   * @param themeMode - The new theme mode to set
   */
  updateThemeMode(themeMode: ThemeMode): void {
    this.updateContextProperty(this.THEME_MODE, themeMode);
  }

  /**
   * Registers the <code>callbackFunction</code> to be called whenever the theme mode changes.
   *
   * @param callbackFunction - The function to call when the theme mode changes.
   * @returns A function to unsubscribe the callback
   */
  onThemeModeChanged(callbackFunction: ValueChangeCallback<ThemeMode | undefined>): () => void {
    return this.subscribe(this.THEME_MODE, callbackFunction);
  }
}
