import { ThemeService } from '../theme.service';
import { ApplicationSettingsStorageService } from '../../application-settings';
import { ApplicationSettings, ThemeMode } from '../../../models/application-settings/application-settings';
import { service } from '../../../providers';
import {createMockStorage, MutableStorage} from '../../utils/test/local-storage-mock';

jest.mock('../../../providers', () => ({
  service: jest.fn(),
}));

const mockService = service as jest.MockedFunction<typeof service>;

describe('ThemeService', () => {
  let themeService: ThemeService;
  let appSettingsService: ApplicationSettingsStorageService;
  let mockRootElement: HTMLElement;
  let storage: MutableStorage;

  beforeEach(() => {
    // fake the LocalStorageService
    storage = createMockStorage();
    appSettingsService = new ApplicationSettingsStorageService();
    jest.spyOn(ApplicationSettingsStorageService.prototype, 'getStorage').mockReturnValue(storage);

    mockService.mockReturnValue(appSettingsService);

    mockRootElement = {
      classList: {
        toggle: jest.fn(),
      },
    } as unknown as HTMLElement;
    jest.spyOn(document, 'querySelector').mockReturnValue(mockRootElement);

    themeService = new ThemeService();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('ThemeService instantiation', () => {
    it('initializes with ApplicationSettingsStorageService via provider', () => {
      expect(themeService).toBeInstanceOf(ThemeService);
      expect(mockService).toHaveBeenCalledWith(ApplicationSettingsStorageService);
    });
  });

  describe('applyDarkModeIfEnabled', () => {
    it('applies dark mode when theme mode is dark', () => {
      appSettingsService.setApplicationSettings(new ApplicationSettings({ themeMode: ThemeMode.dark }));

      themeService.applyDarkModeIfEnabled();

      expect(mockRootElement.classList.toggle).toHaveBeenCalledWith(ThemeMode.dark, true);
    });

    it('applies light mode when theme mode is light', () => {
      appSettingsService.setApplicationSettings(new ApplicationSettings({ themeMode: ThemeMode.light }));

      themeService.applyDarkModeIfEnabled();

      expect(mockRootElement.classList.toggle).toHaveBeenCalledWith(ThemeMode.dark, false);
    });

    it('handles missing root element', () => {
      appSettingsService.setApplicationSettings(new ApplicationSettings({ themeMode: ThemeMode.dark }));
      jest.spyOn(document, 'querySelector').mockReturnValue(null);

      expect(() => themeService.applyDarkModeIfEnabled()).not.toThrow();
      expect(mockRootElement.classList.toggle).not.toHaveBeenCalled();
    });
  });

  describe('setThemeMode', () => {
    it('sets dark mode explicitly', () => {
      themeService.setThemeMode(ThemeMode.dark);

      expect(mockRootElement.classList.toggle).toHaveBeenCalledWith(ThemeMode.dark, true);
    });

    it('sets light mode explicitly', () => {
      themeService.setThemeMode(ThemeMode.light);

      expect(mockRootElement.classList.toggle).toHaveBeenCalledWith(ThemeMode.dark, false);
    });

    it('uses correct root selector', () => {
      themeService.setThemeMode(ThemeMode.dark);

      expect(document.querySelector).toHaveBeenCalledWith(':root');
    });
  });

  describe('applyColorScheme', () => {
    it('applies dark theme when user prefers dark scheme and theme mode is not set', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
        })),
      });

      themeService.applyColorScheme();

      expect(mockRootElement.classList.toggle).toHaveBeenCalledWith(ThemeMode.dark, true);
    });

    it('applies light theme when user prefers light scheme and theme mode is not set', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(() => ({
          matches: false,
        })),
      });

      themeService.applyColorScheme();

      expect(mockRootElement.classList.toggle).toHaveBeenCalledWith(ThemeMode.dark, false);
    });

    it('applies saved settings when theme mode is already set', () => {
      appSettingsService.setApplicationSettings(new ApplicationSettings({ themeMode: ThemeMode.dark }));
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(() => ({
          matches: false,
        })),
      });

      themeService.applyColorScheme();

      expect(mockRootElement.classList.toggle).toHaveBeenCalledWith(ThemeMode.dark, true);
    });
  });

  describe('applyNewColorScheme', () => {
    it('applies new theme when theme mode is not set', () => {
      themeService.applyNewColorScheme(ThemeMode.dark);

      expect(mockRootElement.classList.toggle).toHaveBeenCalledWith(ThemeMode.dark, true);
    });

    it('does not apply new theme when theme mode is already set', () => {
      appSettingsService.setApplicationSettings(new ApplicationSettings({ themeMode: ThemeMode.light }));

      themeService.applyNewColorScheme(ThemeMode.dark);

      expect(mockRootElement.classList.toggle).not.toHaveBeenCalled();
    });
  });

  describe('isDarkModeApplied', () => {
    it('returns true when dark mode class is present', () => {
      mockRootElement = {
        classList: {
          contains: jest.fn().mockReturnValue(true),
        },
      } as unknown as HTMLElement;
      jest.spyOn(document, 'querySelector').mockReturnValue(mockRootElement);

      const result = themeService.isDarkModeApplied();

      expect(result).toBe(true);
      expect(mockRootElement.classList.contains).toHaveBeenCalledWith(ThemeMode.dark);
    });

    it('returns false when dark mode class is not present', () => {
      mockRootElement = {
        classList: {
          contains: jest.fn().mockReturnValue(false),
        },
      } as unknown as HTMLElement;
      jest.spyOn(document, 'querySelector').mockReturnValue(mockRootElement);

      const result = themeService.isDarkModeApplied();

      expect(result).toBe(false);
      expect(mockRootElement.classList.contains).toHaveBeenCalledWith(ThemeMode.dark);
    });

    it('returns false when root element is not found', () => {
      jest.spyOn(document, 'querySelector').mockReturnValue(null);

      const result = themeService.isDarkModeApplied();

      expect(result).toBe(false);
    });
  });

  describe('isDarkModeEnabledInSettings', () => {
    it('returns true when dark mode is set in settings', () => {
      appSettingsService.setApplicationSettings(new ApplicationSettings({ themeMode: ThemeMode.dark }));

      const result = themeService.isDarkModeEnabledInSettings();

      expect(result).toBe(true);
    });

    it('returns false when light mode is set in settings', () => {
      appSettingsService.setApplicationSettings(new ApplicationSettings({ themeMode: ThemeMode.light }));

      const result = themeService.isDarkModeEnabledInSettings();

      expect(result).toBe(false);
    });
  });

  describe('isThemeModeSet', () => {
    it('returns true when theme mode is present in settings', () => {
      appSettingsService.setApplicationSettings(new ApplicationSettings({ themeMode: ThemeMode.dark }));

      const result = themeService.isThemeModeSet();

      expect(result).toBe(true);
    });

    it('returns false when theme mode is not present in settings', () => {
      const result = themeService.isThemeModeSet();

      expect(result).toBe(false);
    });
  });
});
