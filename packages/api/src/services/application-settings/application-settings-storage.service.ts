import {LocalStorageService} from '../storage';
import {ApplicationSettings, ThemeMode} from '../../models/application-settings/application-settings';

/**
 * Service to manage the storage of application settings in the local storage.
 */
export class ApplicationSettingsStorageService extends LocalStorageService {
  readonly NAMESPACE = 'application';
  readonly SETTINGS = 'settings';

  private readonly OLD_SETTINGS_KEY = 'ls.workbench-settings';

  migrate() {
    const oldSettings = this.getAsJson(this.OLD_SETTINGS_KEY) as { theme: string; mode: string } | null;
    if (!oldSettings) {
      return;
    }
    const newSettings = new ApplicationSettings();
    newSettings.theme = oldSettings.theme;
    // map legacy mode to new property if applicable
    if (oldSettings.mode && oldSettings.mode === ThemeMode.dark) {
      newSettings.themeMode = ThemeMode.dark;
    } else {
      newSettings.themeMode = ThemeMode.light;
    }
    this.setApplicationSettings(newSettings);
    this.getStorage().removeItem(this.OLD_SETTINGS_KEY);
  }

  set(key: string, value: string) {
    this.storeValue(key, value);
  }

  /**
   * Saves the application settings to the local storage.
   * @param settings The application settings to save.
   */
  setApplicationSettings(settings: Partial<ApplicationSettings>): void {
    this.set(
      this.SETTINGS,
      JSON.stringify(settings)
    );
  }

  /**
   * Retrieves the application settings from the local storage.
   * @returns The application settings.
   */
  getApplicationSettings(): ApplicationSettings {
    const settings = this.get(this.SETTINGS).getAsJson() as Partial<ApplicationSettings>;
    if (settings) {
      return new ApplicationSettings(settings);
    }
    return new ApplicationSettings();
  }

  /**
   * Retrieves the theme mode from the application settings.
   * @returns The theme mode.
   */
  getThemeMode(): string | null {
    const settings = this.getApplicationSettings();
    return settings.themeMode;
  }
}
