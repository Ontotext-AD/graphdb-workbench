import {
  service,
  AuthenticationService,
  AuthorizationService,
  EventName,
  EventService,
  LicenseContextService,
  LicenseService,
} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';

const logger = LoggerProvider.logger;

/**
 * The license endpoint requires an authenticated or free access user when security is enabled.
 */
const canReadLicense = (): boolean => {
  const authenticationService = service(AuthenticationService);
  return !authenticationService.isSecurityEnabled()
    || authenticationService.isLoggedIn()
    || service(AuthorizationService).hasFreeAccess();
};

const loadLicense = (): Promise<void> => {
  return service(LicenseService).updateLicenseStatus()
    .then(() => undefined)
    // Not rethrown, because a failed license request must not break the workbench bootstrap.
    .catch((error) => logger.error('Could not load the license', error));
};

const clearLicense = (): void => {
  const licenseContextService = service(LicenseContextService);
  licenseContextService.updateGraphdbLicense(undefined);
  licenseContextService.updateIsLicenseHardcoded(undefined);
};

/**
 * Loads the license once on bootstrap, if it is accessible. Must run after the security bootstrap.
 */
const loadInitialLicense = (): Promise<void> => {
  return canReadLicense() ? loadLicense() : Promise.resolve();
};

/**
 * Reloads the license on login and clears it on logout. Must be called after the initial load,
 * otherwise the login event emitted by the security bootstrap would load the license a second time.
 */
const subscribeToLoginState = (): void => {
  const eventService = service(EventService);
  eventService.subscribe(EventName.LOGIN, () => void loadLicense());
  eventService.subscribe(EventName.LOGOUT, clearLicense);
};

export const licenseBootstrap = {loadInitialLicense, subscribeToLoginState};
