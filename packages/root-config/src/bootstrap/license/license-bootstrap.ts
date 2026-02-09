import {service, LicenseService, LicenseContextService} from '@ontotext/workbench-api';

const loadLicense = (): void => {
  const licenseContext = service(LicenseContextService);
  const licenseService = service(LicenseService);
  licenseService.getIsLicenseHardcoded()
    .then((isLicenseHardcoded) => licenseContext.updateIsLicenseHardcoded(isLicenseHardcoded))
    .then(() => licenseService.getLicense())
    .then((license) => licenseContext.updateGraphdbLicense(license))
    .catch(() => {
      // TODO: Check if this catch is needed at all here. For sure the logic below is irrelevant because GDB returns
      // success 200 response even  for invalid license, so the error is not thrown.
      // licenseContext.updateGraphdbLicense(new License({
      //   message: service(TranslationService).translate('license_alert.no_license_set'),
      //   valid: false,
      // }));
    });
};

export const licenseBootstrap = [loadLicense];
