import { LicenseContextService } from '../license-context.service';
import { License } from '../../../models/license';

describe('LicenseContextService', () => {
  let licenseContextService: LicenseContextService;

  beforeEach(() => {
    licenseContextService = new LicenseContextService();
  });

  test('updateLicense should update the license in the context and notify subscribers', () => {
    // Given a new license object
    const newLicense: License = {licensee: 'Test Company', expiryDate: 1672531200000} as License;
    const mockCallback = jest.fn();
    licenseContextService.onLicenseChanged(mockCallback);

    // When updating the license
    licenseContextService.updateLicense(newLicense);

    // Then the context should be updated and subscribers notified
    expect(mockCallback).toHaveBeenLastCalledWith(newLicense);
  });

  test('should stop receiving updates, after unsubscribe', () => {
    // Given a new license object
    const newLicense: License = {licensee: 'Test Company', expiryDate: 1672531200000} as License;
    const mockCallback = jest.fn();
    const unsubscribe = licenseContextService.onLicenseChanged(mockCallback);
    // Clear the callback call when the callback function is registered.
    mockCallback.mockClear();

    // When unsubscribed
    unsubscribe();

    // Then the context should not receive updates
    licenseContextService.updateLicense(newLicense);
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
