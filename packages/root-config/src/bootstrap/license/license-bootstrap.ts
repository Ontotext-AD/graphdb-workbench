import {service, EventName, EventService, LicenseService, LicenseContextService} from '@ontotext/workbench-api';

const loadLicense = (): void => {
  service(LicenseService).updateLicenseStatus()
    .catch(() => {
      // TODO: Check if this catch is needed at all here. For sure the logic below is irrelevant because GDB returns
      // success 200 response even  for invalid license, so the error is not thrown.
      // licenseContext.updateGraphdbLicense(new License({
      //   message: service(TranslationService).translate('license_alert.no_license_set'),
      //   valid: false,
      // }));
    });
};

const clearLicense = (): void => {
  service(LicenseContextService).updateGraphdbLicense(undefined);
};

/**
 * Loads the license on login and clears it on logout, because the endpoint requires an authenticated or free access user.
 */
const subscribeToLoginState = (): void => {
  const eventService = service(EventService);
  eventService.subscribe(EventName.LOGIN, loadLicense);
  eventService.subscribe(EventName.LOGOUT, clearLicense);
};

export const licenseBootstrap = [subscribeToLoginState];
