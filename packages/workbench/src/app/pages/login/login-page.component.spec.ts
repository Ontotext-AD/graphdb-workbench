import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LoginPageComponent} from './login-page.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {
  Configuration,
  ConfigurationContextService,
  RuntimeConfigurationContextService,
  SecurityService,
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
  let securityService: SecurityService;

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
    securityService = ServiceProvider.get(SecurityService);
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

  describe('view conditions', () => {
    const getEl = <T extends HTMLElement>(selector: string): T | null =>
      fixture.nativeElement.querySelector(selector);

    describe('when GDB login is enabled', () => {
      beforeEach(() => {
        jest.spyOn(securityService, 'isPasswordLoginEnabled').mockReturnValue(true);
        jest.spyOn(securityService, 'isOpenIDEnabled').mockReturnValue(false);
        fixture.detectChanges();
      });

      it('should show the login title', () => {
        expect(getEl('h2.login-title')).not.toBeNull();
      });

      it('should show the username input', () => {
        expect(getEl('input[data-test="username-input"]')).not.toBeNull();
      });

      it('should show the password input', () => {
        expect(getEl('input[data-test="password-input"]')).not.toBeNull();
      });

      it('should show the submit button', () => {
        expect(getEl('button[data-test="submit-btn"]')).not.toBeNull();
      });

      it('should not show the OpenID button', () => {
        const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
        const openIdButton = buttons.find((b) => b.textContent?.trim().includes('Login with OpenID'));
        expect(openIdButton).toBeUndefined();
      });

      it('should not add openid-login class to the login card', () => {
        expect(getEl('.login-card')?.classList.contains('openid-login')).toBe(false);
      });
    });

    describe('when GDB login is disabled', () => {
      beforeEach(() => {
        jest.spyOn(securityService, 'isPasswordLoginEnabled').mockReturnValue(false);
        jest.spyOn(securityService, 'isOpenIDEnabled').mockReturnValue(false);
        fixture.detectChanges();
      });

      it('should not show the login title', () => {
        expect(getEl('h2.login-title')).toBeNull();
      });

      it('should not show the username input', () => {
        expect(getEl('input[data-test="username-input"]')).toBeNull();
      });

      it('should not show the password input', () => {
        expect(getEl('input[data-test="password-input"]')).toBeNull();
      });

      it('should not show the submit button', () => {
        expect(getEl('button[data-test="submit-btn"]')).toBeNull();
      });
    });

    describe('when OpenID login is enabled', () => {
      beforeEach(() => {
        jest.spyOn(securityService, 'isPasswordLoginEnabled').mockReturnValue(false);
        jest.spyOn(securityService, 'isOpenIDEnabled').mockReturnValue(true);
        fixture.detectChanges();
      });

      it('should show the OpenID sign-in button', () => {
        const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
        const openIdButton = Array.from(buttons).find((b) => b.textContent?.trim().includes('Login with OpenID'));
        expect(openIdButton).toBeDefined();
      });

      it('should add openid-login class to the login card', () => {
        expect(getEl('.login-card')?.classList.contains('openid-login')).toBe(true);
      });

      it('should not show GDB form fields', () => {
        expect(getEl('input[data-test="username-input"]')).toBeNull();
        expect(getEl('input[data-test="password-input"]')).toBeNull();
        expect(getEl('button[data-test="submit-btn"]')).toBeNull();
      });
    });

    describe('when both GDB and OpenID login are enabled', () => {
      beforeEach(() => {
        jest.spyOn(securityService, 'isPasswordLoginEnabled').mockReturnValue(true);
        jest.spyOn(securityService, 'isOpenIDEnabled').mockReturnValue(true);
        fixture.detectChanges();
      });

      it('should show both GDB form fields and the OpenID button', () => {
        expect(getEl('input[data-test="username-input"]')).not.toBeNull();
        expect(getEl('input[data-test="password-input"]')).not.toBeNull();
        expect(getEl('button[data-test="submit-btn"]')).not.toBeNull();
        const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
        const openIdButton = Array.from(buttons).find((b) => b.textContent?.trim().includes('Login with OpenID'));
        expect(openIdButton).toBeDefined();
      });

      it('should add openid-login class to the login card', () => {
        expect(getEl('.login-card')?.classList.contains('openid-login')).toBe(true);
      });
    });

    describe('wrong credentials error state', () => {
      beforeEach(() => {
        jest.spyOn(securityService, 'isPasswordLoginEnabled').mockReturnValue(true);
        jest.spyOn(securityService, 'isOpenIDEnabled').mockReturnValue(false);
        fixture.detectChanges();
      });

      it('should not apply has-error class to inputs by default', () => {
        expect(getEl('input[data-test="username-input"]')?.classList.contains('has-error')).toBe(false);
        expect(getEl('input[data-test="password-input"]')?.classList.contains('has-error')).toBe(false);
      });

      it('should apply has-error class to inputs when wrongCredentials form error is set', () => {
        component.loginForm.setErrors({wrongCredentials: true});
        fixture.detectChanges();

        expect(getEl('input[data-test="username-input"]')?.classList.contains('has-error')).toBe(true);
        expect(getEl('input[data-test="password-input"]')?.classList.contains('has-error')).toBe(true);
      });

      it('should remove has-error class from inputs when wrongCredentials error is cleared', () => {
        component.loginForm.setErrors({wrongCredentials: true});
        fixture.detectChanges();

        component.loginForm.setErrors(null);
        fixture.detectChanges();

        expect(getEl('input[data-test="username-input"]')?.classList.contains('has-error')).toBe(false);
        expect(getEl('input[data-test="password-input"]')?.classList.contains('has-error')).toBe(false);
      });
    });
  });
});
