import {Service} from '../../providers/service/service';
import {service} from '../../providers';
import {ApplicationSettingsStorageService} from '../application-settings';
import {ThemeMode} from '../../models/application-settings/application-settings';

/**
 * Service to manage the theme of the application.
 */
export class ThemeService implements Service {
  private readonly applicationSettingsStorageService: ApplicationSettingsStorageService =
    service(ApplicationSettingsStorageService);

  private readonly rootSelector = ':root';
  private readonly darkClass = ThemeMode.dark;

  /**
   * YASQE theme for dark mode.
   */
  static readonly YASQE_DARK_THEME = 'moxer';

  /**
   * Applies the theme based on the saved application settings.
   */
  applyDarkMode(): void {
    const mode = this.isDarkModeEnabledInSettings() ? ThemeMode.dark : ThemeMode.light;
    this.setThemeMode(mode);
  }

  /**
   * Explicitly sets the theme mode.
   * @param mode The desired theme mode.
   */
  setThemeMode(mode: ThemeMode): void {
    const rootElement = this.getRootElement();
    if (!rootElement) {
      return;
    }

    const isDark = mode === ThemeMode.dark;
    rootElement.classList.toggle(this.darkClass, isDark);
  }

  /**
   * Checks whether dark mode is currently applied on the document.
   *
   * @returns `true` if the dark mode is applied, `false` otherwise.
   */
  isDarkModeApplied(){
    const rootElement = this.getRootElement();
    if (!rootElement) {
      return false;
    }
    const darkMode = ThemeMode.dark;
    return rootElement.classList.contains(darkMode);
  }

  /**
   * @returns `true` if dark mode is enabled in the saved settings.
   */
  private isDarkModeEnabledInSettings(): boolean {
    const settings = this.applicationSettingsStorageService.getApplicationSettings();
    return settings?.themeMode === ThemeMode.dark;
  }

  /**
   * @return the root `:root` element.
   */
  private getRootElement(): HTMLElement | null {
    const rootElement = document.querySelector<HTMLElement>(this.rootSelector);
    return rootElement ?? null;
  }
}
