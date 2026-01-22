import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LoginPageComponent} from './login-page.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {
  Configuration,
  ConfigurationContextService,
  RuntimeConfigurationContextService,
  ServiceProvider,
  ThemeMode
} from '@ontotext/workbench-api';
import {ActivatedRoute, Router} from '@angular/router';

const createTestConfiguration = (): Configuration => {
  return {
    applicationLogoPaths: {
      light: 'assets/graphdb-logo-light.svg',
      dark: 'assets/graphdb-logo-dark.svg'
    },
    applicationLogoPath: 'assets/graphdb-logo-dark.svg',
    applicationFaviconPath: 'assets/favicon.png',
    pluginsManifestPath: 'plugins/plugins-manifest.json',
    loggerConfig: {
      loggers: [],
      minLogLevel: 'DEBUG'
    }
  } as Configuration;
};

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let runtimeConfigurationContextService: RuntimeConfigurationContextService;
  let configurationContextService: ConfigurationContextService;

  const mockActivatedRoute = {
    snapshot: {
      queryParamMap: {
        get: jest.fn(),
        has: jest.fn()
      }
    }
  };

  const mockRouter = {
    navigateByUrl: jest.fn()
  };

  beforeEach(async () => {
    // Initialize configuration context before component creation
    configurationContextService = ServiceProvider.get(ConfigurationContextService);
    configurationContextService.updateApplicationConfiguration(createTestConfiguration());

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent, provideTranslocoForTesting()],
      providers: [
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        {provide: Router, useValue: mockRouter}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;

    // Get actual service instances
    runtimeConfigurationContextService = ServiceProvider.get(RuntimeConfigurationContextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('subscribeToThemeModeChange', () => {
    it('should update logoPath when theme mode changes to dark', () => {
      const lightLogoPath = 'assets/graphdb-logo-light.svg';
      jest.spyOn(configurationContextService, 'getApplicationLogoPath').mockReturnValue(lightLogoPath);

      // Initialize component (which calls subscribeToThemeModeChange)
      component.ngOnInit();

      // Simulate theme mode change to dark
      runtimeConfigurationContextService.updateThemeMode(ThemeMode.dark);

      expect(configurationContextService.getApplicationLogoPath).toHaveBeenCalledWith(ThemeMode.dark);
      expect(component.logoPath()).toBe(lightLogoPath);
    });

    it('should update logoPath when theme mode changes to light', () => {
      const darkLogoPath = 'assets/graphdb-logo-dark.svg';
      jest.spyOn(configurationContextService, 'getApplicationLogoPath').mockReturnValue(darkLogoPath);

      // Initialize component (which calls subscribeToThemeModeChange)
      component.ngOnInit();

      // Simulate theme mode change to light
      runtimeConfigurationContextService.updateThemeMode(ThemeMode.light);

      expect(configurationContextService.getApplicationLogoPath).toHaveBeenCalledWith(ThemeMode.light);
      expect(component.logoPath()).toBe(darkLogoPath);
    });

    it('should handle multiple theme mode changes', () => {
      const lightLogoPath = 'assets/graphdb-logo-light.svg';
      const darkLogoPath = 'assets/graphdb-logo-dark.svg';
      const getLogoPathSpy = jest.spyOn(configurationContextService, 'getApplicationLogoPath')
        // Initial call when subscription is set up (current theme mode is undefined)
        .mockReturnValueOnce(darkLogoPath)
        // First change to dark
        .mockReturnValueOnce(lightLogoPath)
        // Then change to light
        .mockReturnValueOnce(darkLogoPath)
        // Then back to dark
        .mockReturnValueOnce(lightLogoPath);

      component.ngOnInit();

      // First change to dark
      runtimeConfigurationContextService.updateThemeMode(ThemeMode.dark);
      expect(getLogoPathSpy).toHaveBeenCalledWith(ThemeMode.dark);
      expect(component.logoPath()).toBe(lightLogoPath);

      // Then change to light
      runtimeConfigurationContextService.updateThemeMode(ThemeMode.light);
      expect(getLogoPathSpy).toHaveBeenCalledWith(ThemeMode.light);
      expect(component.logoPath()).toBe(darkLogoPath);

      // Then back to dark
      runtimeConfigurationContextService.updateThemeMode(ThemeMode.dark);
      expect(getLogoPathSpy).toHaveBeenCalledWith(ThemeMode.dark);
      expect(component.logoPath()).toBe(lightLogoPath);

      expect(getLogoPathSpy).toHaveBeenCalledTimes(4);
    });

    it('should unsubscribe from theme mode changes on component destroy', () => {
      jest.spyOn(configurationContextService, 'getApplicationLogoPath').mockReturnValue('path/to/logo.svg');

      component.ngOnInit();

      // Verify subscription is active
      runtimeConfigurationContextService.updateThemeMode(ThemeMode.dark);

      // Destroy component (which should unsubscribe)
      component.ngOnDestroy();

      // Verify subscription is no longer active
      runtimeConfigurationContextService.updateThemeMode(ThemeMode.light);
    });

    it('should add unsubscribe function to subscriptions array', () => {
      const initialLength = component['subscriptions'].length;

      component.ngOnInit();

      expect(component['subscriptions'].length).toBe(initialLength + 1);
      expect(typeof component['subscriptions'].at(-1)).toBe('function');
    });
  });

  describe('ngOnInit', () => {
    it('should call subscribeToThemeModeChange', () => {
      const subscribeToThemeModeChangeSpy = jest.spyOn(component as never, 'subscribeToThemeModeChange');

      component.ngOnInit();

      expect(subscribeToThemeModeChangeSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe all subscriptions', () => {
      const mockUnsubscribe1 = jest.fn();
      const mockUnsubscribe2 = jest.fn();

      component['subscriptions'].push(mockUnsubscribe1, mockUnsubscribe2);

      component.ngOnDestroy();

      expect(mockUnsubscribe1).toHaveBeenCalled();
      expect(mockUnsubscribe2).toHaveBeenCalled();
    });

    it('should not throw error when calling ngOnDestroy multiple times', () => {
      component.ngOnInit();

      expect(() => {
        component.ngOnDestroy();
        component.ngOnDestroy();
      }).not.toThrow();
    });
  });
});
