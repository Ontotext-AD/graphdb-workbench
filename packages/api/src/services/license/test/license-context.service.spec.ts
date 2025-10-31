import { LicenseContextService } from '../license-context.service';
import { License } from '../../../models/license';

describe('LicenseContextService', () => {
  let licenseContextService: LicenseContextService;

  beforeEach(() => {
    licenseContextService = new LicenseContextService();
  });

  test('updateLicense should update the license in the context and notify subscribers', () => {
    // Given a new license object
    const newLicense = new License({licensee: 'Test Company', expiryDate: new Date(1672531200000)});
    let expectedLicense;
    const mockCallback = jest.fn((lic) => expectedLicense = lic);
    licenseContextService.onLicenseChanged(mockCallback);

    // When updating the license
    licenseContextService.updateGraphdbLicense(newLicense);

    // Then the context should be updated and subscribers notified
    expect(mockCallback).toHaveBeenLastCalledWith(expect.any(License));
    expect(expectedLicense).toMatchObject(newLicense);
  });

  test('should stop receiving updates, after unsubscribe', () => {
    // Given a new license object
    const newLicense = new License({licensee: 'Test Company', expiryDate: new Date(1672531200000)});
    const mockCallback = jest.fn();
    const unsubscribe = licenseContextService.onLicenseChanged(mockCallback);
    // Clear the callback call when the callback function is registered.
    mockCallback.mockClear();

    // When unsubscribed
    unsubscribe();

    // Then the context should not receive updates
    licenseContextService.updateGraphdbLicense(newLicense);
    expect(mockCallback).not.toHaveBeenCalled();
  });

  test('getLicense should return the license from the context', () => {
    // Given a new license object
    const newLicense = new License({licensee: 'Test Company', expiryDate: new Date(1672531200000)});
    licenseContextService.updateGraphdbLicense(newLicense);

    // When getting the license
    const license = licenseContextService.getLicenseSnapshot();

    // Then the license should be the same as the one set in the context
    expect(license).toEqual(newLicense);
  });

  test('updateIsLicenseHardcoded should update the hardcoded status in the context and notify subscribers', () => {
    // Given a hardcoded status value
    let actualHardcodedStatus: boolean | undefined;
    const mockCallback = jest.fn((status) => actualHardcodedStatus = status);
    licenseContextService.onIsLicenseHardcodedChanged(mockCallback);

    // When updating the hardcoded status to true
    licenseContextService.updateIsLicenseHardcoded(true);

    // Then the context should be updated and subscribers notified
    expect(mockCallback).toHaveBeenLastCalledWith(true);
    expect(actualHardcodedStatus).toBe(true);

    // And when updating to false
    licenseContextService.updateIsLicenseHardcoded(false);
    expect(mockCallback).toHaveBeenLastCalledWith(false);
    expect(actualHardcodedStatus).toBe(false);
  });

  test('updateIsLicenseHardcoded should convert undefined to false', () => {
    // Given undefined as the hardcoded status
    let actualHardcodedStatus: boolean | undefined;
    const mockCallback = jest.fn((status) => actualHardcodedStatus = status);
    licenseContextService.onIsLicenseHardcodedChanged(mockCallback);

    // When updating the hardcoded status with undefined
    licenseContextService.updateIsLicenseHardcoded(undefined);

    // Then the context should be updated to false
    expect(mockCallback).toHaveBeenLastCalledWith(false);
    expect(actualHardcodedStatus).toBe(false);
  });

  test('should stop receiving hardcoded status updates after unsubscribe', () => {
    // Given a subscription to hardcoded status changes
    const mockCallback = jest.fn();
    const unsubscribe = licenseContextService.onIsLicenseHardcodedChanged(mockCallback);
    // Clear the callback call when the callback function is registered
    mockCallback.mockClear();

    // When unsubscribed
    unsubscribe();

    // Then the context should not receive updates
    licenseContextService.updateIsLicenseHardcoded(true);
    expect(mockCallback).not.toHaveBeenCalled();
  });

  test('isLicenseHardcodedSnapshot should return the hardcoded status from the context', () => {
    // Given a hardcoded status set to true
    licenseContextService.updateIsLicenseHardcoded(true);

    // When getting the hardcoded status
    const isHardcoded = licenseContextService.isLicenseHardcodedSnapshot();

    // Then the status should be true
    expect(isHardcoded).toBe(true);

    // And when updated to false
    licenseContextService.updateIsLicenseHardcoded(false);
    const isHardcodedAfter = licenseContextService.isLicenseHardcodedSnapshot();

    // Then the status should be false
    expect(isHardcodedAfter).toBe(false);
  });

  test('isLicenseHardcodedSnapshot should return undefined when not set', () => {
    // Given no hardcoded status has been set

    // When getting the hardcoded status
    const isHardcoded = licenseContextService.isLicenseHardcodedSnapshot();

    // Then the status should be undefined
    expect(isHardcoded).toBeUndefined();
  });

  test('getLicenseSnapshot should return undefined when no license is set', () => {
    // Given no license has been set

    // When getting the license
    const license = licenseContextService.getLicenseSnapshot();

    // Then the license should be undefined
    expect(license).toBeUndefined();
  });

  test('updateGraphdbLicense should accept undefined and notify subscribers', () => {
    // Given a license is set
    const initialLicense = new License({licensee: 'Test Company', expiryDate: new Date()});
    licenseContextService.updateGraphdbLicense(initialLicense);

    let actualLicense: License | undefined;
    const mockCallback = jest.fn((lic) => actualLicense = lic);
    licenseContextService.onLicenseChanged(mockCallback);

    // When updating the license to undefined
    licenseContextService.updateGraphdbLicense(undefined);

    // Then the context should be updated and subscribers notified with undefined
    expect(mockCallback).toHaveBeenLastCalledWith(undefined);
    expect(actualLicense).toBeUndefined();
    expect(licenseContextService.getLicenseSnapshot()).toBeUndefined();
  });
});
