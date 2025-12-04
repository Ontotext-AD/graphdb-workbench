import { ApplicationSettingsStorageService } from '../application-settings-storage.service';
import { ApplicationSettings, LegacySettings, ThemeMode } from '../../../models/application-settings';
import {createMockStorage, MutableStorage} from '../../utils/test/local-storage-mock';

const APPLICATION_SETTINGS_KEY = 'ontotext.gdb.application.settings';

describe('ApplicationSettingsStorageService', () => {
  let service: ApplicationSettingsStorageService;
  let storage: MutableStorage;
  let removeItemSpy: jest.SpyInstance;

  beforeEach(() => {
    // fake the LocalStorageService
    storage = createMockStorage();
    removeItemSpy = jest.spyOn(storage, 'removeItem');
    service = new ApplicationSettingsStorageService();
    jest.spyOn(ApplicationSettingsStorageService.prototype, 'getStorage').mockReturnValue(storage);
  });

  it('should not migrate when new settings already exist', () => {
    const existing = new ApplicationSettings({ themeMode: ThemeMode.dark });
    storage.setItem(APPLICATION_SETTINGS_KEY, existing.toString());

    service.migrate();

    expect(removeItemSpy).not.toHaveBeenCalled();
    // Ensure settings untouched
    const stored = JSON.parse(storage.getItem(APPLICATION_SETTINGS_KEY)!);
    expect(stored.themeMode).toBe(ThemeMode.dark);
  });

  it('should migrate legacy settings and remove old key', () => {
    // Legacy settings present
    const legacy: LegacySettings = {
      theme: 'my-theme',
      mode: ThemeMode.dark,
    };
    storage.setItem('ls.workbench-settings', JSON.stringify(legacy));

    service.migrate();

    // Legacy settings should be migrated
    expect(service.getApplicationSettings()).toEqual(
      new ApplicationSettings({ theme: 'my-theme',  themeMode: ThemeMode.dark })
    );
    // Old settings key should be removed
    expect(removeItemSpy).toHaveBeenCalledWith('ls.workbench-settings');
  });

  it('should not migrate when no legacy settings', () => {
    service.migrate();

    expect(removeItemSpy).not.toHaveBeenCalled();
  });

  it('should set application settings as JSON string', () => {
    const payload: Partial<ApplicationSettings> = { themeMode: ThemeMode.light, theme: 'blue' };

    service.setApplicationSettings(payload);

    const raw = storage.getItem(APPLICATION_SETTINGS_KEY)!;
    expect(JSON.parse(raw)).toEqual(payload);
  });

  it('should get application settings when stored', () => {
    const payload: Partial<ApplicationSettings> = { themeMode: ThemeMode.dark, theme: 'blue' };
    storage.setItem(APPLICATION_SETTINGS_KEY, JSON.stringify(payload));

    const result = service.getApplicationSettings();

    expect(result).toBeInstanceOf(ApplicationSettings);
    expect(result.themeMode).toBe(ThemeMode.dark);
    expect(result.theme).toBe('blue');
  });

  it('should return default application settings when none stored', () => {
    const result = service.getApplicationSettings();

    expect(result).toBeInstanceOf(ApplicationSettings);
    expect([ThemeMode.dark, ThemeMode.light]).toContain(result.themeMode);
  });

  it('should get theme mode from settings', () => {
    const payload: Partial<ApplicationSettings> = { themeMode: ThemeMode.dark };
    storage.setItem(APPLICATION_SETTINGS_KEY, JSON.stringify(payload));

    const mode = service.getThemeMode();

    expect(mode).toBe(ThemeMode.dark);
  });

  it('should delegate set to storeValue', () => {
    service.set('custom-key', 'val');

    expect(storage.getItem('ontotext.gdb.application.custom-key')).toBe('val');
  });

  it('should return true when theme mode is present in settings', () => {
    const payload: Partial<ApplicationSettings> = { themeMode: ThemeMode.dark };
    storage.setItem(APPLICATION_SETTINGS_KEY, JSON.stringify(payload));

    const result = service.isThemeModePresent();

    expect(result).toBe(true);
  });

  it('should return true when theme mode is not explicitly set but defaults are applied', () => {
    const payload: Partial<ApplicationSettings> = { theme: 'blue' };
    storage.setItem(APPLICATION_SETTINGS_KEY, JSON.stringify(payload));

    const result = service.isThemeModePresent();

    expect(result).toBe(true);
  });

  it('should return false when no settings are stored', () => {
    const result = service.isThemeModePresent();

    expect(result).toBe(false);
  });
});
