const EVALUATION_TYPE_1 = "this is an evaluation license";
const EVALUATION_TYPE_2 = "evaluation";

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
 * - `isLicenseValid`: Checks if the current license is valid.
 * - `license`: Returns the current license object.
 * - `loadingLicense`: Returns whether the license is being loaded.
 * - `isLicenseHardcoded`: Checks if the license is hardcoded.
 * - `showLicense`: Determines if the license should be shown in the UI.
 * - `productType`: Returns the current product type associated with the license.
 * - `productTypeHuman`: Returns a human-readable version of the product type.
 */

function licenseService($window, $document, LicenseRestService, $translate) {
    let _license = undefined;
    let _loadingLicense = false;
    let _isLicenseHardcoded = false;
    let _showLicense = false;
    let _productType = undefined;
    let _productTypeHuman = undefined;

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
                    message: $translate.instant('no.license.set.msg'),
                    valid: false
                };
            })
            .finally(() => {
                updateProductType(_license);
                _showLicense = true;
                _loadingLicense = false;
            });
    };

    const updateProductType = (license) => {
        _productType = license.productType;
        if (_productType === "standard") {
            _productTypeHuman = "Standard";
        } else if (_productType === "enterprise") {
            _productTypeHuman = "Enterprise";
        } else if (_productType === "free") {
            _productTypeHuman = "Free";
        } else if (_productType === "graphdb") {
            _productTypeHuman = "GraphDB";
        }
    };

    const isFreeLicense = () => {
        const licenseTypeOfUse = _license && _license.typeOfUse.toLowerCase();
        return _productType === "free" || licenseTypeOfUse === EVALUATION_TYPE_1 || licenseTypeOfUse === EVALUATION_TYPE_2;
    };

    const isLicenseValid = () => {
        return _license && _license.valid;
    };

    const license = () => {
        return _license;
    };

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
        return _productType;
    };

    const productTypeHuman = () => {
        return _productTypeHuman;
    };

    return {
        checkLicenseStatus,
        isLicenseValid,
        license,
        loadingLicense,
        isLicenseHardcoded,
        showLicense,
        productType,
        productTypeHuman,
        isFreeLicense
    };
}
