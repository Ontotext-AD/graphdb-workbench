import { ApplicationSettings, ThemeMode } from '../application-settings';

describe('ApplicationSettings', () => {
  describe('isSystemMode', () => {
    it('returns true when themeMode is system', () => {
      const settings = new ApplicationSettings({ themeMode: ThemeMode.system });

      expect(settings.isSystemMode()).toBe(true);
    });

    it('returns false when themeMode is light', () => {
      const settings = new ApplicationSettings({ themeMode: ThemeMode.light });

      expect(settings.isSystemMode()).toBe(false);
    });

    it('returns false when themeMode is dark', () => {
      const settings = new ApplicationSettings({ themeMode: ThemeMode.dark });

      expect(settings.isSystemMode()).toBe(false);
    });

    it('returns false when using default themeMode (light)', () => {
      const settings = new ApplicationSettings();

      expect(settings.isSystemMode()).toBe(false);
    });
  });
});
