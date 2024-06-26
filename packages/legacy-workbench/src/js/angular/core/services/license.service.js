const EVALUATION_TYPE_1 = "this is an evaluation license";
const EVALUATION_TYPE_2 = "evaluation";
const PRODUCT_FREE = "free";
const PRODUCT_SANDBOX = "sandbox";
const NO_LICENSE_MSG = "No license was set";

angular.module('graphdb.framework.core.services.licenseService', [])
    .service('$licenseService', ['$window', '$document', 'LicenseRestService', '$translate', licenseService]);

/**
 * Service to manage and check license status, types, and tracking permissions.
 * @param {object} $window - Angular service to interact with the window object.
 * @param {object} $document - Angular service to interact with the document object.
 * @param {object} LicenseRestService - Service for fetching license information from the backend.
 * @param {object} $translate - Angular translate service for internationalization.
 * @return {object} An object exposing methods for checking and managing license information:
 * - `checkLicenseStatus`: Fetches license status and updates local variables.
 * - `isTrackableLicense`: Checks if the license should be tracked.
 * - `isLicensePresent`: Checks if any license is present (valid or not).
 * - `isLicenseValid`: Checks if the current license is valid.
 * - `license`: Returns the current license object.
 * - `licenseErrorMsg`: Returns the error messages describing the reason for license being invalid.
 * - `loadingLicense`: Returns whether the license is being loaded.
 * - `isLicenseHardcoded`: Checks if the license is hardcoded.
 * - `showLicense`: Determines if the license should be shown in the UI.
 * - `productType`: Returns the current product type associated with the license (free, sandbox, standard, enterprise).
 */

function licenseService($window, $document, LicenseRestService, $translate) {
    let _license = undefined;
    let _loadingLicense = false;
    let _isLicenseHardcoded = false;
    let _showLicense = false;

    /**
     * Fetches license status and updates local variables related to license and product type.
     * @return {Promise<void>} A promise that resolves once the license status is fetched and processed.
     */
    const checkLicenseStatus = () => {
        _loadingLicense = true;
        return LicenseRestService.getHardcodedLicense()
            .then((res) => {
                _isLicenseHardcoded = (res.data === 'true');
                return LicenseRestService.getLicenseInfo();
            })
            .then((res) => {
                _license = res.data;
            })
            .catch(() => {
                _isLicenseHardcoded = true;
                _license = {
                    message: NO_LICENSE_MSG,
                    present: false,
                    valid: false
                };
            })
            .finally(() => {
                _showLicense = true;
                _loadingLicense = false;
            });
    };

    const isTrackableLicense = () => {
        const licenseTypeOfUse = _license && _license.typeOfUse.toLowerCase();
        return !isLicensePresent() || productType() === PRODUCT_FREE || productType() === PRODUCT_SANDBOX
            || licenseTypeOfUse === EVALUATION_TYPE_1 || licenseTypeOfUse === EVALUATION_TYPE_2;
    };

    const isLicensePresent = () => {
        return _license && _license.present;
    };

    const isLicenseValid = () => {
        return _license && _license.valid;
    };

    const license = () => {
        return _license;
    };

    const licenseErrorMsg = () => {
        if (!_license?.present && _license?.message === NO_LICENSE_MSG) {
            return $translate.instant('no.license.set.msg');
        } else {
            return $translate.instant("error.license", {message: _license?.message});
        }
    }

    const loadingLicense = () => {
        return _loadingLicense;
    };

    const isLicenseHardcoded = () => {
        return _isLicenseHardcoded;
    };

    const showLicense = () => {
        return _showLicense;
    };

    const productType = () => {
        return _license?.productType;
    };

    return {
        checkLicenseStatus,
        isLicensePresent,
        isLicenseValid,
        license,
        licenseErrorMsg,
        loadingLicense,
        isLicenseHardcoded,
        showLicense,
        productType,
        isTrackableLicense
    };
}
