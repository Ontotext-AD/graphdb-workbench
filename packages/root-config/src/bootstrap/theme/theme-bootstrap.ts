import {
  service,
  ThemeService,
  ThemeMode,
  WindowService,
} from '@ontotext/workbench-api';

/**
 * Handles changes in the user's color scheme preference.
 * Color mode is only updated if the user has not manually set a theme in the application.
 * @param e - The MediaQueryListEvent object containing information about the change.
 */
const colorSchemeChangeHandler = (e: MediaQueryListEvent): void => {
  const newTheme = e.matches ? ThemeMode.dark : ThemeMode.light;
  service(ThemeService).applyNewColorScheme(newTheme);
};

/**
 * Subscribes to changes in the user's color scheme preference.
 */
const subscribeToColorSchemeChanges = (): void => {
  const mediaQuery = WindowService.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', colorSchemeChangeHandler);
};

export const bootstrapTheme = (): void => {
  // Apply a color scheme based on system preference changes
  subscribeToColorSchemeChanges();
  // Apply an initial color scheme based on user preference or system setting
  service(ThemeService).applyColorScheme();
};
