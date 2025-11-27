export enum ThemeMode {
  'light' = 'light',
  'dark' = 'dark',
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

  constructor(data?: Partial<ApplicationSettings>) {
    if (data) {
      this.theme = data.theme ?? this.theme;
      this.themeMode = data.themeMode ?? this.themeMode;
    }
  }

  toString(): string {
    return JSON.stringify(this);
  }
}
