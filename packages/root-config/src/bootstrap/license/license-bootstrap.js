import {service, LicenseService, LicenseContextService, TranslationService, License} from '@ontotext/workbench-api';

const loadLicense = () => {
  const licenseContext = service(LicenseContextService);
  const licenseService = service(LicenseService);
  licenseService.getIsLicenseHardcoded()
    .then((isLicenseHardcoded) => licenseContext.updateIsLicenseHardcoded(isLicenseHardcoded))
    .then(() => licenseService.getLicense())
    .then((license) => licenseContext.updateGraphdbLicense(license))
    .catch(() => {
      licenseContext.updateGraphdbLicense(new License({
        message: service(TranslationService).translate('license_alert.no_license_set'),
        valid: false,
      }));
    });
};

export const licenseBootstrap = [loadLicense];
