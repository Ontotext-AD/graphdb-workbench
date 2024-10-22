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
                _isLicenseHardcoded = (res === 'true');
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
                updateTracking(_license);
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

    /**
     * Updates the tracking behavior based on the user's tracking consent or permission.
     * @private
     */
    const updateTracking = () => {
        if (isTrackingAllowed()) {
            addGoogleTagManagerScript();
        } else {
            removeGoogleTagManagerScripts();
        }
    };

    /**
     * Determines if tracking is allowed based on license status and product type.
     * @return {boolean} A promise that resolves to a boolean indicating if tracking is allowed.
     */
    const isTrackingAllowed = () => {
        const licenseTypeOfUse = _license && _license.typeOfUse.toLowerCase();
        return !$window.wbDevMode &&
            (_productType === "free" ||
                licenseTypeOfUse === EVALUATION_TYPE_1 ||
                licenseTypeOfUse === EVALUATION_TYPE_2);
    };

    /**
     * Adds the Google Tag Manager (GTM) script to the document's head if it is not already present.
     * This function creates a new script element for GTM and appends it to the document's head.
     * @private
     */
    const addGoogleTagManagerScript = () => {
        if (!gtmScriptExists()) {
            const dataLayerScript = $document[0].createElement('script');
            dataLayerScript.text = "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'}); var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:''; j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl; f.parentNode.insertBefore(j,f); })(window,document,'script','dataLayer','GTM-WBP6C6Z4');";
            $document[0].getElementsByTagName('head')[0].appendChild(dataLayerScript);
        }
    };

    /**
     * Checks if a Google Tag Manager (GTM) script is already present in the document.
     *
     * When the GTM script is injected, it dynamically adds additional scripts depending on how many tags
     * are configured within your GTM container. These scripts are usually inserted into the `<head>` section,
     * but it’s better to search through the entire document to ensure all related GTM scripts are found.
     *
     * This function searches through all `<script>` elements in the document and returns `true` if any script
     * has a `src` attribute that contains 'googletagmanager'. It returns `false` otherwise.
     *
     * @return {boolean} - Returns `true` if a GTM script is found, otherwise `false`.
     * @private
     */
    const gtmScriptExists = () => {
        const scripts = $document[0].getElementsByTagName('script');
        return Array.from(scripts).some((script) => script.src && script.src.includes('googletagmanager'));
    };

    /**
     * Disables the Google Tag Manager (GTM) by preventing any further events from being pushed to the `dataLayer`.
     * This function also removes all existing GTM script elements from the document's head and body.
     *
     * Since this is a Single Page Application (SPA), removing and re-adding scripts must happen dynamically without
     * reloading the window. This method is used to remove GTM scripts when tracking is disallowed, rather than
     * performing a page reload, which is generally avoided
     *
     * 1. Disables the `dataLayer.push` method to prevent further GTM events from being tracked.
     * 2. Searches for and removes any `<script>` elements that include 'googletagmanager' in their `src` or script content.
     *
     * @private
     */
    const removeGoogleTagManagerScripts = () => {
        if (!gtmScriptExists()) {
            return;
        }

        if ($window.dataLayer) {
            $window.dataLayer.push = function () {
                return null;
            };
        }
        const scripts = $document[0].getElementsByTagName('script');
        const regex = /googletagmanager/i;

        // Iterate through all script elements and remove those that match the regex.
        for (let i = scripts.length - 1; i >= 0; i--) {
            if (scripts[i].src && regex.test(scripts[i].src)) {
                scripts[i].parentNode.removeChild(scripts[i]);
            } else if (regex.test(scripts[i].text)) {
                scripts[i].parentNode.removeChild(scripts[i]);
            }
        }
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
        isTrackingAllowed
    };
}
