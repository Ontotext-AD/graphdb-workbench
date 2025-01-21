import {ServiceProvider, LicenseService, LicenseContextService, TranslationService} from '@ontotext/workbench-api';

const loadLicense = () => {
  const licenseContext = ServiceProvider.get(LicenseContextService);
  return ServiceProvider.get(LicenseService).getLicense()
    .then((license) => {
      licenseContext.updateGraphdbLicense(license);
    })
    .catch(() => {
      licenseContext.updateGraphdbLicense({
        message: ServiceProvider.get(TranslationService).translate('license_alert.no_license_set'),
        valid: false
      });
    });
};

export const licenseBootstrap = [loadLicense];
