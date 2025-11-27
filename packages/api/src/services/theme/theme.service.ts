import {Service} from '../../providers/service/service';
import {service} from '../../providers';
import {ApplicationSettingsStorageService} from '../application-settings';
import {ThemeMode} from '../../models/application-settings/application-settings';

/**
 * Service to manage the theme of the application.
 */
export class ThemeService implements Service {
  private readonly applicationSettingsStorageService: ApplicationSettingsStorageService = service(ApplicationSettingsStorageService);

  /**
   * Applies the dark theme mode if it's saved in the local storage with the workbench settings. Otherwise, the dark
   * mode is not applied.
   */
  applyDarkMode() {
    const settings = this.applicationSettingsStorageService.getApplicationSettings();
    if (settings.themeMode === ThemeMode.dark) {
      const rootElement = document.querySelector(':root');
      if (!rootElement) {
        return;
      }
      rootElement.classList.add(ThemeMode.dark);
    }
  }

  /**
   * Toggles the theme mode: light or dark. If the provided mode is set, then remove it and vice versa.
   * @param {string} mode
   */
  toggleThemeMode(mode: ThemeMode) {
    const rootElement = document.querySelector(':root');
    if (!rootElement) {
      return;
    }
    if (mode === ThemeMode.dark) {
      rootElement.classList.add(ThemeMode.dark);
    } else {
      rootElement.classList.remove(ThemeMode.dark);
    }
  };
}
