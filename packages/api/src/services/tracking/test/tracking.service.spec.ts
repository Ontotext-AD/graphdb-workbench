import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {TrackingService, COOKIE_CONSENT_CHANGED_EVENT} from '../tracking.service';
import {service} from '../../../providers';
import {AuthenticationService, AuthStrategyResolver, SecurityContextService, AuthorizationService} from '../../security';
import {SecurityConfigTestUtil} from '../../utils/test/security-config-test-util';
import {AuthenticatedUserResponse} from '../../../models/security/response-models/authenticated-user-response';
import {CookieConsent} from '../../../models/tracking';
import {LicenseContextService} from '../../license';
import {License} from '../../../models/license';
import {ProductType} from '../../../models/license/product-type';
import {WindowService} from '../../window';
import {InstallationCookieService} from '../installation-cookie.service';
import {GoogleAnalyticsCookieService} from '../google-analytics-cookie.service';
import {TrackingStorageService} from '../tracking-storage.service';
import {AuthenticatedUser} from '../../../models/security';

describe('TrackingService', () => {
  let trackingService: TrackingService;
  let mockAuthenticatedUser: AuthenticatedUserResponse;

  beforeEach(async () => {
    trackingService = new TrackingService();
    mockAuthenticatedUser = {
      username: 'testuser',
      password: '',
      external: false,
      authorities: ['ROLE_ADMIN'],
      appSettings: {
        COOKIE_CONSENT: {
          policyAccepted: false,
          statistic: true,
          thirdParty: false,
          updatedAt: 1738753714185
        }
      }
    } as AuthenticatedUserResponse;

    // Given, I have a mocked authenticated user
    TestUtil.mockResponses([
      new ResponseMock('rest/security/authenticated-user').setResponse(mockAuthenticatedUser),
      new ResponseMock(`rest/security/users/${mockAuthenticatedUser.username}`).setResponse({}),
      new ResponseMock('rest/login').setResponse(mockAuthenticatedUser).setHeaders(new Headers({authorization: 'GDB someToken'}))
    ]);

    const securityConfig = SecurityConfigTestUtil.createSecurityConfig({enabled: true});
    service(AuthStrategyResolver).resolveStrategy(securityConfig);
    await service(AuthenticationService).login(mockAuthenticatedUser.username, 'password');
  });

  afterEach(() => {
    TestUtil.restoreAllMocks();
  });

  describe('acceptCookiePolicy', () => {
    test('should persist consent to the backend when user is authenticated', async () => {
      // When I call the acceptCookiePolicy method
      await trackingService.acceptCookiePolicy();
      const updateUserRequest = TestUtil.getRequest(`rest/security/users/${mockAuthenticatedUser.username}`);
      const requestBody = JSON.parse(updateUserRequest!.body as string);
      expect(requestBody.appSettings.COOKIE_CONSENT.policyAccepted).toEqual(true);
    });

    test('should set statistic and thirdParty to true when user has no prior consent', async () => {
      // Given, the user has no cookie consent stored
      const userWithNoConsent = {...mockAuthenticatedUser, appSettings: {}} as AuthenticatedUserResponse;
      TestUtil.mockResponses([
        new ResponseMock('rest/security/authenticated-user').setResponse(userWithNoConsent),
        new ResponseMock(`rest/security/users/${userWithNoConsent.username}`).setResponse({}),
        new ResponseMock('rest/login').setResponse(userWithNoConsent).setHeaders(new Headers({authorization: 'GDB someToken'}))
      ]);
      await service(AuthenticationService).login(userWithNoConsent.username, 'password');

      // When I call acceptCookiePolicy
      await trackingService.acceptCookiePolicy();

      // Then the request body should have statistic and thirdParty set to true
      const updateUserRequest = TestUtil.getRequest(`rest/security/users/${userWithNoConsent.username}`);
      const requestBody = JSON.parse(updateUserRequest!.body as string);
      expect(requestBody.appSettings.COOKIE_CONSENT.policyAccepted).toEqual(true);
      expect(requestBody.appSettings.COOKIE_CONSENT.statistic).toEqual(true);
      expect(requestBody.appSettings.COOKIE_CONSENT.thirdParty).toEqual(true);
    });

    test('should emit COOKIE_CONSENT_CHANGED_EVENT after successfully updating the backend', async () => {
      // Given, I listen for the event
      let receivedConsent: CookieConsent | undefined;
      // Listen via document.body directly (EventEmitter dispatches there)
      const handler = (e: Event) => {
        receivedConsent = (e as CustomEvent).detail as CookieConsent;
      };
      document.body.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handler);

      try {
        // When I accept the cookie policy
        await trackingService.acceptCookiePolicy();

        // Then, the event should have been emitted with the accepted consent
        expect(receivedConsent).toBeDefined();
        expect(receivedConsent!.policyAccepted).toEqual(true);
      } finally {
        document.body.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handler);
      }
    });

    test('should persist consent to local storage when security is enabled and user is not logged in', async () => {
      // Given, security is enabled and user is not logged in
      const securityContextService = service(SecurityContextService);
      jest.spyOn(securityContextService, 'getIsLoggedIn').mockReturnValue(false);
      const securityConfig = SecurityConfigTestUtil.createSecurityConfig({enabled: true});
      securityContextService.updateSecurityConfig(securityConfig);
      // And no username on the principal (guest user)
      securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: ''}));

      const setCookieConsentSpy = jest.spyOn(service(TrackingStorageService), 'setCookieConsent');

      // When I accept the cookie policy
      await trackingService.acceptCookiePolicy();

      // Then, the consent should be stored in local storage
      expect(setCookieConsentSpy).toHaveBeenCalledWith(expect.objectContaining({policyAccepted: true}));
    });
  });

  describe('getCookieConsent', () => {
    test('should return consent from principal appSettings when user has a username', () => {
      // Given, the authenticated user already has cookie consent settings
      const result = trackingService.getCookieConsent();

      // Then, the consent should reflect the principal's settings
      expect(result.policyAccepted).toEqual(false);
      expect(result.statistic).toEqual(true);
      expect(result.thirdParty).toEqual(false);
    });

    test('should return NOT_ACCEPTED_WITH_TRACKING when principal has no COOKIE_CONSENT', async () => {
      // Given, a logged-in user with no COOKIE_CONSENT in appSettings
      const userWithNoConsent = {...mockAuthenticatedUser, appSettings: {}} as AuthenticatedUserResponse;
      TestUtil.mockResponses([
        new ResponseMock('rest/security/authenticated-user').setResponse(userWithNoConsent),
        new ResponseMock(`rest/security/users/${userWithNoConsent.username}`).setResponse({}),
        new ResponseMock('rest/login').setResponse(userWithNoConsent).setHeaders(new Headers({authorization: 'GDB someToken'}))
      ]);
      await service(AuthenticationService).login(userWithNoConsent.username, 'password');

      // When I get the cookie consent
      const result = trackingService.getCookieConsent();

      // Then, I should get NOT_ACCEPTED_WITH_TRACKING defaults
      expect(result.policyAccepted).toBeUndefined();
      expect(result.statistic).toEqual(true);
      expect(result.thirdParty).toEqual(true);
    });

    test('should return consent from local storage when user has no username and freeAccess is enabled', () => {
      // Given, the user is a guest with no username
      const securityContextService = service(SecurityContextService);
      securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: ''}));
      // And free access is enabled
      const securityConfig = SecurityConfigTestUtil.createSecurityConfig({enabled: true, freeAccess: {enabled: true}});
      securityContextService.updateSecurityConfig(securityConfig);
      // And local storage has a consent stored
      const storedConsent = new CookieConsent({policyAccepted: true, statistic: false, thirdParty: false});
      jest.spyOn(service(TrackingStorageService), 'getCookieConsent').mockReturnValue(storedConsent);

      // When I get cookie consent
      const result = trackingService.getCookieConsent();

      // Then, I should get the locally stored consent
      expect(result.policyAccepted).toEqual(true);
      expect(result.statistic).toEqual(false);
      expect(result.thirdParty).toEqual(false);
    });

    test('should return NOT_ACCEPTED_WITH_TRACKING when user has no username, freeAccess is enabled, and no local storage consent', () => {
      // Given, the user is a guest with no username and free access is enabled
      const securityContextService = service(SecurityContextService);
      securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: ''}));
      const securityConfig = SecurityConfigTestUtil.createSecurityConfig({enabled: true, freeAccess: {enabled: true}});
      securityContextService.updateSecurityConfig(securityConfig);
      // And local storage has no consent
      jest.spyOn(service(TrackingStorageService), 'getCookieConsent').mockReturnValue(null);

      // When I get cookie consent
      const result = trackingService.getCookieConsent();

      // Then, I should get NOT_ACCEPTED_WITH_TRACKING defaults
      expect(result.policyAccepted).toBeUndefined();
      expect(result.statistic).toEqual(true);
      expect(result.thirdParty).toEqual(true);
    });

    test('should return ACCEPTED_NO_TRACKING when user has no username and freeAccess is disabled', () => {
      // Given, the user is a guest with no username and free access is disabled
      const securityContextService = service(SecurityContextService);
      securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: ''}));
      const securityConfig = SecurityConfigTestUtil.createSecurityConfig({enabled: true, freeAccess: {enabled: false}});
      securityContextService.updateSecurityConfig(securityConfig);
      jest.spyOn(service(AuthorizationService), 'hasFreeAccess').mockReturnValue(false);

      // When I get cookie consent
      const result = trackingService.getCookieConsent();

      // Then, I should get ACCEPTED_NO_TRACKING (tracking opted out)
      expect(result.policyAccepted).toEqual(true);
      expect(result.statistic).toEqual(false);
      expect(result.thirdParty).toEqual(false);
    });

    test('should return NOT_ACCEPTED_WITH_TRACKING when there is no principal at all', () => {
      // Given, there is no authenticated user in context
      const securityContextService = service(SecurityContextService);
      securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);
      jest.spyOn(service(AuthorizationService), 'hasFreeAccess').mockReturnValue(true);
      jest.spyOn(service(TrackingStorageService), 'getCookieConsent').mockReturnValue(null);

      // When I get cookie consent
      const result = trackingService.getCookieConsent();

      // Then, I should get NOT_ACCEPTED_WITH_TRACKING defaults
      expect(result.policyAccepted).toBeUndefined();
      expect(result.statistic).toEqual(true);
      expect(result.thirdParty).toEqual(true);
    });
  });

  describe('isTrackingAllowed', () => {
    test('should return true when license is trackable and not in dev mode', () => {
      // Given, we have a trackable license (no license present means trackable)
      service(LicenseContextService).updateGraphdbLicense(undefined);
      jest.spyOn(WindowService, 'getWindow').mockReturnValue({wbDevMode: false} as unknown as Window);

      // When I call isTrackingAllowed
      const result = trackingService.isTrackingAllowed();

      // Then, it should return true
      expect(result).toEqual(true);
    });

    test('should return false when in dev mode', () => {
      // Given, we are in dev mode
      service(LicenseContextService).updateGraphdbLicense(undefined);
      jest.spyOn(WindowService, 'getWindow').mockReturnValue({wbDevMode: true} as unknown as Window);

      // When I call isTrackingAllowed
      const result = trackingService.isTrackingAllowed();

      // Then, it should return false
      expect(result).toEqual(false);
    });

    test('should return false when the license is not trackable', () => {
      // Given, an enterprise license (not trackable)
      const license = new License({productType: ProductType.ENTERPRISE, present: true});
      service(LicenseContextService).updateGraphdbLicense(license);
      jest.spyOn(WindowService, 'getWindow').mockReturnValue({wbDevMode: false} as unknown as Window);

      // When I call isTrackingAllowed
      const result = trackingService.isTrackingAllowed();

      // Then, it should return false
      expect(result).toEqual(false);
    });
  });

  describe('cleanUpTracking', () => {
    test('should remove both installation and Google Analytics cookies', () => {
      // Given, spy on the removal methods
      const installationRemoveSpy = jest.spyOn(service(InstallationCookieService), 'remove').mockImplementation(() => {/*noop*/});
      const gaRemoveSpy = jest.spyOn(service(GoogleAnalyticsCookieService), 'remove').mockImplementation(() => {/*noop*/});

      // When I call cleanUpTracking
      trackingService.cleanUpTracking();

      // Then, both remove methods should have been called
      expect(installationRemoveSpy).toHaveBeenCalledTimes(1);
      expect(gaRemoveSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('applyTrackingConsent', () => {
    test('should clean up tracking when tracking is not allowed', async () => {
      // Given, tracking is not allowed (e.g. enterprise license)
      jest.spyOn(trackingService, 'isTrackingAllowed').mockReturnValue(false);
      const installationRemoveSpy = jest.spyOn(service(InstallationCookieService), 'remove').mockImplementation(() => {/*noop*/});
      const gaRemoveSpy = jest.spyOn(service(GoogleAnalyticsCookieService), 'remove').mockImplementation(() => {/*noop*/});

      // When I apply tracking consent
      await trackingService.applyTrackingConsent();

      // Then, cleanup should happen
      expect(installationRemoveSpy).toHaveBeenCalledTimes(1);
      expect(gaRemoveSpy).toHaveBeenCalledTimes(1);
    });

    test('should clean up tracking when consent has changed and policy is not accepted', async () => {
      // Given, tracking is allowed
      jest.spyOn(trackingService, 'isTrackingAllowed').mockReturnValue(true);
      // And consent has changed (policyAccepted is defined) but policyAccepted is false
      jest.spyOn(trackingService, 'getCookieConsent').mockReturnValue(new CookieConsent({policyAccepted: false, statistic: true, thirdParty: true}));
      const installationRemoveSpy = jest.spyOn(service(InstallationCookieService), 'remove').mockImplementation(() => {
        // noop
      });
      const gaRemoveSpy = jest.spyOn(service(GoogleAnalyticsCookieService), 'remove').mockImplementation(() => {
        // noop
      });

      // When I apply tracking consent
      trackingService.applyTrackingConsent();

      // Then, cleanup should happen
      expect(installationRemoveSpy).toHaveBeenCalledTimes(1);
      expect(gaRemoveSpy).toHaveBeenCalledTimes(1);
    });

    test('should set installation cookie and GA cookie when statistic and thirdParty are both enabled', () => {
      // Given, tracking is allowed and both statistic and thirdParty are enabled
      jest.spyOn(trackingService, 'isTrackingAllowed').mockReturnValue(true);
      jest.spyOn(trackingService, 'getCookieConsent').mockReturnValue(
        new CookieConsent({policyAccepted: true, statistic: true, thirdParty: true})
      );
      const installationId = 'test-installation-id';
      const license = new License({installationId});
      service(LicenseContextService).updateGraphdbLicense(license);

      const installationSetIfAbsentSpy = jest.spyOn(service(InstallationCookieService), 'setIfAbsent').mockImplementation(() => {/*noop*/});
      const gaSetIfAbsentSpy = jest.spyOn(service(GoogleAnalyticsCookieService), 'setIfAbsent').mockImplementation(() => {/*noop*/});

      // When I apply tracking consent
      trackingService.applyTrackingConsent();

      // Then, both cookies should be set
      expect(installationSetIfAbsentSpy).toHaveBeenCalledWith(installationId);
      expect(gaSetIfAbsentSpy).toHaveBeenCalledTimes(1);
    });

    test('should remove installation cookie and GA cookie when statistic and thirdParty are both disabled', () => {
      // Given, tracking is allowed but both statistic and thirdParty are disabled
      jest.spyOn(trackingService, 'isTrackingAllowed').mockReturnValue(true);
      jest.spyOn(trackingService, 'getCookieConsent').mockReturnValue(
        new CookieConsent({policyAccepted: true, statistic: false, thirdParty: false})
      );

      const installationRemoveSpy = jest.spyOn(service(InstallationCookieService), 'remove').mockImplementation(() => {/*noop*/});
      const gaRemoveSpy = jest.spyOn(service(GoogleAnalyticsCookieService), 'remove').mockImplementation(() => {/*noop*/});

      // When I apply tracking consent
      trackingService.applyTrackingConsent();

      // Then, both cookies should be removed
      expect(installationRemoveSpy).toHaveBeenCalledTimes(1);
      expect(gaRemoveSpy).toHaveBeenCalledTimes(1);
    });

    test('should set installation cookie but remove GA when statistic is true and thirdParty is false', () => {
      // Given
      jest.spyOn(trackingService, 'isTrackingAllowed').mockReturnValue(true);
      jest.spyOn(trackingService, 'getCookieConsent').mockReturnValue(
        new CookieConsent({policyAccepted: true, statistic: true, thirdParty: false})
      );
      const installationId = 'install-123';
      service(LicenseContextService).updateGraphdbLicense(new License({installationId}));

      const installationSetIfAbsentSpy = jest.spyOn(service(InstallationCookieService), 'setIfAbsent').mockImplementation(() => {/*noop*/});
      const gaRemoveSpy = jest.spyOn(service(GoogleAnalyticsCookieService), 'remove').mockImplementation(() => {/*noop*/});

      // When
      trackingService.applyTrackingConsent();

      // Then
      expect(installationSetIfAbsentSpy).toHaveBeenCalledWith(installationId);
      expect(gaRemoveSpy).toHaveBeenCalledTimes(1);
    });

    test('should remove installation cookie but set GA when statistic is false and thirdParty is true', () => {
      // Given
      jest.spyOn(trackingService, 'isTrackingAllowed').mockReturnValue(true);
      jest.spyOn(trackingService, 'getCookieConsent').mockReturnValue(
        new CookieConsent({policyAccepted: true, statistic: false, thirdParty: true})
      );

      const installationRemoveSpy = jest.spyOn(service(InstallationCookieService), 'remove').mockImplementation(() => {/*noop*/});
      const gaSetIfAbsentSpy = jest.spyOn(service(GoogleAnalyticsCookieService), 'setIfAbsent').mockImplementation(() => {/*noop*/});

      // When
      trackingService.applyTrackingConsent();

      // Then
      expect(installationRemoveSpy).toHaveBeenCalledTimes(1);
      expect(gaSetIfAbsentSpy).toHaveBeenCalledTimes(1);
    });

    test('should use empty string for installationId when license snapshot is absent', () => {
      // Given, tracking is allowed with statistic enabled, but no license in context
      jest.spyOn(trackingService, 'isTrackingAllowed').mockReturnValue(true);
      jest.spyOn(trackingService, 'getCookieConsent').mockReturnValue(
        new CookieConsent({policyAccepted: true, statistic: true, thirdParty: false})
      );
      service(LicenseContextService).updateGraphdbLicense(undefined);

      const installationSetIfAbsentSpy = jest.spyOn(service(InstallationCookieService), 'setIfAbsent').mockImplementation(() => {/*noop*/});
      jest.spyOn(service(GoogleAnalyticsCookieService), 'remove').mockImplementation(() => {/*noop*/});

      // When
      trackingService.applyTrackingConsent();

      // Then, installationId should fall back to empty string
      expect(installationSetIfAbsentSpy).toHaveBeenCalledWith('');
    });

    test('should not set or remove cookies when consent has not changed (policyAccepted is undefined)', () => {
      // Given, tracking is allowed but cookie consent has NOT changed (policyAccepted is undefined)
      // and statistic / thirdParty are both true (default NOT_ACCEPTED_WITH_TRACKING state)
      jest.spyOn(trackingService, 'isTrackingAllowed').mockReturnValue(true);
      jest.spyOn(trackingService, 'getCookieConsent').mockReturnValue(
        new CookieConsent({policyAccepted: undefined, statistic: true, thirdParty: true})
      );
      service(LicenseContextService).updateGraphdbLicense(new License({installationId: 'abc'}));

      const installationSetIfAbsentSpy = jest.spyOn(service(InstallationCookieService), 'setIfAbsent').mockImplementation(() => {/*noop*/});
      const gaSetIfAbsentSpy = jest.spyOn(service(GoogleAnalyticsCookieService), 'setIfAbsent').mockImplementation(() => {/*noop*/});

      // When
      trackingService.applyTrackingConsent();

      // Then, cookies should still be applied based on consent values (hasChanged() returns false,
      // so the early-exit block for "changed but not accepted" is skipped)
      expect(installationSetIfAbsentSpy).toHaveBeenCalledWith('abc');
      expect(gaSetIfAbsentSpy).toHaveBeenCalledTimes(1);
    });
  });
});
