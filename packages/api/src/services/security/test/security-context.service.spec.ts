import {SecurityContextService} from '../security-context.service';
import {RestrictedPages} from '../../../models/security/restricted-pages';

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
});
