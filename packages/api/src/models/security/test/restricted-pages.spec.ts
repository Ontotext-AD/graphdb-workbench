import {RestrictedPages} from '../restricted-pages';

describe('Restricted pages model', () => {
  test('isRestricted should return true if page is restricted', () => {
    const newPermissions = new RestrictedPages();
    newPermissions.setPageRestriction('/restricted-page');
    expect(newPermissions.isRestricted('/restricted-page')).toBeTruthy();
  });

  test('isRestricted should return false if page is unrestricted', () => {
    const newPermissions = new RestrictedPages();
    newPermissions.setPageRestriction('/restricted-page', false);
    expect(newPermissions.isRestricted('/restricted-page')).toBeFalsy();
  });

  test('isRestricted should return false if there are not restricted page information', () => {
    const newPermissions = new RestrictedPages();
    expect(newPermissions.isRestricted('/restricted-page')).toBeFalsy();
  });
});
