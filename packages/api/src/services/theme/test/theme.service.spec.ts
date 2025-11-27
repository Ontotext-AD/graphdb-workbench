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

  describe('applyDarkMode', () => {
    it('applies dark mode when theme mode is dark', () => {
      appSettingsService.setApplicationSettings(new ApplicationSettings({ themeMode: ThemeMode.dark }));

      themeService.applyDarkMode();

      expect(mockRootElement.classList.toggle).toHaveBeenCalledWith(ThemeMode.dark, true);
    });

    it('applies light mode when theme mode is light', () => {
      appSettingsService.setApplicationSettings(new ApplicationSettings({ themeMode: ThemeMode.light }));

      themeService.applyDarkMode();

      expect(mockRootElement.classList.toggle).toHaveBeenCalledWith(ThemeMode.dark, false);
    });

    it('handles missing root element', () => {
      appSettingsService.setApplicationSettings(new ApplicationSettings({ themeMode: ThemeMode.dark }));
      jest.spyOn(document, 'querySelector').mockReturnValue(null);

      expect(() => themeService.applyDarkMode()).not.toThrow();
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
});

