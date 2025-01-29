import {SecurityContextService} from '../security-context.service';
import {RestrictedPages} from '../../../models/security/restricted-pages';
import {AuthenticatedUser, SecurityConfig} from '../../../models/security';

describe('SecurityContextService', () => {
  let securityContextService: SecurityContextService;

  beforeEach(() => {
    securityContextService = new SecurityContextService();
  });

  test('Should call onRestrictedPagesChanged callback with correct denied routes', () => {
    const onPermissionChangedCallBackFunction = jest.fn();
    const newPermissions = new RestrictedPages();
    newPermissions.setPageRestriction('/testPage');

    // Given I register a callback function for permission changes
    securityContextService.onRestrictedPagesChanged(onPermissionChangedCallBackFunction);
    // When I update the permissions
    securityContextService.updateRestrictedPages(newPermissions);
    // Then I expect the callback function to be called with the passed object of routes
    expect(onPermissionChangedCallBackFunction).toHaveBeenLastCalledWith(newPermissions);
    // And the contained routes should be correct
    expect(onPermissionChangedCallBackFunction.mock.lastCall[0]).toEqual(newPermissions);
  });

  test('Should not call callback, if unsubscribed', () => {
    const onPermissionChangedCallBackFunction = jest.fn();

    // Given I have registered a callback
    const unsubscribeFunction = securityContextService.onRestrictedPagesChanged(onPermissionChangedCallBackFunction);
    // When I clear the first callback call when the callback function is registered
    onPermissionChangedCallBackFunction.mockClear();
    // And I unsubscribe the function from the permission change event,
    unsubscribeFunction();
    // And the permissions are updated
    securityContextService.updateRestrictedPages(new RestrictedPages());
    // Then I expect the callback function to not be called.
    expect(onPermissionChangedCallBackFunction).toHaveBeenCalledTimes(0);
  });

  test('getRestrictedPages should return a copy of restricted pages.', () => {
    const restrictedPages = new RestrictedPages();
    restrictedPages.setPageRestriction('/testPage');

    securityContextService.updateRestrictedPages(restrictedPages);
    const restrictedPagesFromContext = securityContextService.getRestrictedPages();
    expect(restrictedPagesFromContext).toEqual(restrictedPages);
    expect(restrictedPagesFromContext).not.toBe(restrictedPages);
  });

  test('Should call the "onSecurityConfigChangedCallBackFunction" when the security config changes.', () => {
    // Given, I have a new security config
    const onSecurityConfigChangedCallBackFunction = jest.fn();
    const newSecurityConfig = {
      freeAccess: {},
      overrideAuth: {},
      appSettings: {},
      methodSettings: {},
      passwordLoginEnabled: true,
      hasExternalAuth: false,
      authImplementation: 'Local',
      openIdEnabled: false,
    } as unknown as SecurityConfig;

    // When I register a callback function for security config changes,
    securityContextService.onSecurityConfigChanged(onSecurityConfigChangedCallBackFunction);
    // and the security config is updated,
    securityContextService.updateSecurityConfig(newSecurityConfig);

    // Then I expect the callback function to be called with the passed security config.
    expect(onSecurityConfigChangedCallBackFunction).toHaveBeenCalledWith(newSecurityConfig);
  });

  test('should stop calling the "onSecurityConfigChangedCallBackFunction" when unsubscribed from the event.', () => {
    // Given:
    // I have registered the onSecurityConfigChangedCallbackFunction as a callback.
    const onSecurityConfigChangedCallBackFunction = jest.fn();
    const unsubscribeFunction = securityContextService.onSecurityConfigChanged(onSecurityConfigChangedCallBackFunction);
    // Clear the first callback call when the callback function is registered.
    onSecurityConfigChangedCallBackFunction.mockClear();

    // When I unsubscribe the function from the security config event,
    unsubscribeFunction();
    // and the security config is updated,
    securityContextService.updateSecurityConfig({} as unknown as SecurityConfig);

    // Then I expect the callback function not to be called.
    expect(onSecurityConfigChangedCallBackFunction).not.toHaveBeenCalled();
  });

  test('Should call the "onAuthenticatedUserChangedCallBackFunction" when the authenticated user changes.', () => {
    // Given, I have a new authenticated user
    const onAuthenticatedUserChangedCallBackFunction = jest.fn();
    const newAuthenticatedUser = {
      username: 'user',
      password: '{bcrypt}$2a$10$JLkoDjlfMF8i9IOsHmsCie3tXCR.FedIlhxq1hqyNF8OmrODS4ca.',
      authorities: ['ROLE_USER', 'READ_REPO_*', 'WRITE_REPO_*'],
      appSettings: {},
      external: false
    } as unknown as AuthenticatedUser;

    // When I register a callback function for authenticated user changes,
    securityContextService.onAuthenticatedUserChanged(onAuthenticatedUserChangedCallBackFunction);
    // and the authenticated user is updated,
    securityContextService.updateAuthenticatedUser(newAuthenticatedUser);

    // Then I expect the callback function to be called with the passed authenticated user.
    expect(onAuthenticatedUserChangedCallBackFunction).toHaveBeenCalledWith(newAuthenticatedUser);
  });

  test('should stop calling the "onAuthenticatedUserChangedCallBackFunction" when unsubscribed from the event.', () => {
    // Given, I have registered the onAuthenticatedUserChangedCallbackFunction as a callback.
    const onAuthenticatedUserChangedCallBackFunction = jest.fn();
    const unsubscribeFunction = securityContextService.onAuthenticatedUserChanged(onAuthenticatedUserChangedCallBackFunction);
    // Clear the first callback call when the callback function is registered.
    onAuthenticatedUserChangedCallBackFunction.mockClear();

    // When I unsubscribe the function from the authenticated user event,
    unsubscribeFunction();
    // and the authenticated user is updated,
    securityContextService.updateAuthenticatedUser({} as unknown as AuthenticatedUser);

    // Then I expect the callback function not to be called.
    expect(onAuthenticatedUserChangedCallBackFunction).not.toHaveBeenCalled();
  });
});
