import {Service} from '../../providers/service/service';
import {service} from '../../providers';
import {ApplicationSettingsStorageService} from '../application-settings';
import {ThemeMode} from '../../models/application-settings';
import {WindowService} from '../window';
import {RuntimeConfigurationContextService} from '../runtime-configuration';

/**
 * Service to manage the theme of the application.
 */
export class ThemeService implements Service {
  private readonly applicationSettingsStorageService = service(ApplicationSettingsStorageService);
  private readonly runtimeConfigurationContextService = service(RuntimeConfigurationContextService);

  private readonly rootSelector = ':root';
  private readonly darkClass = ThemeMode.dark;

  /**
   * Code editors theme name used in dark mode.
   */
  static readonly CODE_EDITOR_DARK_THEME = 'moxer';

  /**
   * Applies the theme based on the saved application settings.
   */
  applyDarkModeIfEnabled(): void {
    const mode = this.isDarkModeEnabledInSettings() ? ThemeMode.dark : ThemeMode.light;
    this.setThemeMode(mode);
  }

  /**
   * Determines the current theme mode to be applied in the application. The method checks if the user has manually set
   * a theme mode in the application settings. If a theme mode is set, it returns that mode (dark, light, or system). If no theme
   * mode is set by the user, it falls back to the system's preferred color scheme, returning dark or light based on the
   * user's system settings.
   * @returns The current theme mode to be applied in the application.
   */
  getCurrentThemeMode(): ThemeMode {
    return this.applicationSettingsStorageService.getThemeModeRaw() ?? this.getPreferredScheme();
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
    this.runtimeConfigurationContextService.updateThemeMode(isDark ? ThemeMode.dark : ThemeMode.light);
  }

  /**
   * Applies the color scheme to the application based on system preferences and saved settings.
   * If the user has not manually chosen a theme, the method applies the system's preferred color scheme (dark or light
   * mode). If the user has previously set a theme in the application settings, that preference takes precedence and is
   * applied instead.
   */
  applyColorScheme() {
    // Only set initial theme if user has NOT manually chosen a theme or if system mode is set
    if (this.isSystemThemeMode() || !this.isThemeModeSet()) {
      this.setThemeMode(this.getPreferredScheme());
    } else {
      this.applyDarkModeIfEnabled();
    }
  }

  /**
   * Applies a new color scheme based on the user's preference. Updates the system theme mode in the context
   * The theme will only be updated if the user has not manually chosen a theme.
   * @param newTheme The new theme mode based on the user's preference.
   */
  applyNewColorScheme(newTheme: ThemeMode){
    this.runtimeConfigurationContextService.updateSystemThemeMode(newTheme);
    // Only auto-update if user has NOT manually chosen a theme
    if (this.isSystemThemeMode() || !this.isThemeModeSet()) {
      this.setThemeMode(newTheme);
    }
  };

  /**
   * Returns the stored theme mode, or {@link ThemeMode.system} when nothing has been persisted yet.
   * Use this to initialise UI controls that need a concrete selection including the system option.
   */
  getThemeModeOrSystem(): ThemeMode {
    return this.isThemeModeSet() ? this.getCurrentThemeMode() : ThemeMode.system;
  }

  /**
   * Checks if the current theme mode is set to dark.
   *
   * @returns `true` if the current theme mode is set to system.
   */
  isSystemThemeMode() {
    return this.getCurrentThemeMode() === ThemeMode.system;
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
  isDarkModeEnabledInSettings() {
    const settings = this.applicationSettingsStorageService.getApplicationSettings();
    return settings?.themeMode === ThemeMode.dark;
  }

  /**
   * @returns `true` if the theme mode is set in the saved settings.
   */
  isThemeModeSet() {
    return this.applicationSettingsStorageService.isThemeModePresent();
  }

  /**
   * @returns {string | undefined} the theme name to be used in the code editor.
   */
  getCodeEditorThemeName(): string | undefined  {
    return this.isDarkModeApplied() ? ThemeService.CODE_EDITOR_DARK_THEME : undefined;
  }

  getPreferredScheme(): ThemeMode {
    const prefersDarkScheme = WindowService.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDarkScheme ? ThemeMode.dark : ThemeMode.light;
  }

  /**
   * @return the root `:root` element.
   */
  private getRootElement(): HTMLElement | null {
    const rootElement = document.querySelector<HTMLElement>(this.rootSelector);
    return rootElement ?? null;
  }
}
