import {JsonldExportSettings} from './jsonld-export-settings';

export enum ThemeMode {
  'light' = 'light',
  'dark' = 'dark',
  'system' = 'system',
}

/**
 * Interface for legacy settings format
 */
export interface LegacySettings {
  theme: string;
  mode: string;
}

/**
 * Internal application settings model representing configurations that define the behavior and appearance of the
 * application.
 */
export class ApplicationSettings {
  /**
   * The theme of the application.
   */
  theme = 'default';
  /**
   * The theme mode of the application (e.g., light or dark).
   */
  themeMode: ThemeMode = ThemeMode.light;

  jsonLdExportSettings?: JsonldExportSettings;

  constructor(data?: Partial<ApplicationSettings>) {
    if (data) {
      this.theme = data.theme ?? this.theme;
      this.themeMode = data.themeMode ?? this.themeMode;
      this.jsonLdExportSettings = data.jsonLdExportSettings ?? this.jsonLdExportSettings;
    }
  }

  /**
   * Checks if the application theme is set to system mode.
   *
   * @returns true if the theme mode is set to system, false otherwise.
   */
  isSystemMode(): boolean {
    return this.themeMode === ThemeMode.system;
  }

  toString(): string {
    return JSON.stringify(this);
  }
}
