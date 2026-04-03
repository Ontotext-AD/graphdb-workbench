import {
  service,
  ThemeService,
  ThemeMode,
  WindowService,
  RuntimeConfigurationContextService,
} from '@ontotext/workbench-api';

const importThemeStylesheet = (theme: ThemeMode): Promise<void> => {
  return import(`graphwise-styleguide/dist/variables-${theme}.css`);
};

/**
 * Handles changes in the user's color scheme preference.
 * Color mode is only updated if the user has not manually set a theme in the application.
 * @param e - The MediaQueryListEvent object containing information about the change.
 */
const colorSchemeChangeHandler = (e: MediaQueryListEvent): void => {
  const newTheme = e.matches ? ThemeMode.dark : ThemeMode.light;
  importThemeStylesheet(newTheme).then(() => service(ThemeService).applyNewColorScheme(newTheme));
};

/**
 * Subscribes to changes in the user's color scheme preference.
 */
const subscribeToColorSchemeChanges = (): void => {
  const mediaQuery = WindowService.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', colorSchemeChangeHandler);
};

const subscribeToThemeModeChanges = (): void => {
  service(RuntimeConfigurationContextService).onThemeModeChanged((newThemeMode) => {
    if (newThemeMode) {
      importThemeStylesheet(newThemeMode);
    }
  });
};

export const bootstrapTheme = (): void => {
  // Apply a color scheme based on system preference changes
  subscribeToColorSchemeChanges();
  subscribeToThemeModeChanges();
  // Apply an initial color scheme based on user preference or system setting
  const themeService = service(ThemeService);
  const theme = themeService.getCurrentThemeMode();
  importThemeStylesheet(theme);
  themeService.applyColorScheme();
};
