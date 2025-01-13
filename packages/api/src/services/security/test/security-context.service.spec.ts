import {SecurityContextService} from '../security-context.service';
import {DeniedPermissions} from '../../../models/security/denied-permissions';

describe('SecurityContextService', () => {
  let securityContextService: SecurityContextService;

  beforeEach(() => {
    securityContextService = new SecurityContextService();
  });

  test('Should call onUserPagePermissionChange callback with correct denied routes', () => {
    const onPermissionChangedCallBackFunction = jest.fn();
    const newPermissions = {'/testPage': true} as DeniedPermissions;

    // Given I register a callback function for permission changes
    securityContextService.onUserPagePermissionChange(onPermissionChangedCallBackFunction);
    // When I update the permissions
    securityContextService.updateHasPermission(newPermissions);
    // Then I expect the callback function to be called with the passed object of routes
    expect(onPermissionChangedCallBackFunction).toHaveBeenLastCalledWith(newPermissions);
    // And the contained routes should be correct
    expect(onPermissionChangedCallBackFunction.mock.lastCall[0]).toEqual(newPermissions);
  });

  test('Should not call callback, if unsubscribed', () => {
    const onPermissionChangedCallBackFunction = jest.fn();

    // Given I have registered a callback
    const unsubscribeFunction = securityContextService.onUserPagePermissionChange(onPermissionChangedCallBackFunction);
    // When I clear the first callback call when the callback function is registered
    onPermissionChangedCallBackFunction.mockClear();
    // And I unsubscribe the function from the permission change event,
    unsubscribeFunction();
    // And the permissions are updated
    securityContextService.updateHasPermission({});
    // Then I expect the callback function to not be called.
    expect(onPermissionChangedCallBackFunction).toHaveBeenCalledTimes(0);
  });
});
