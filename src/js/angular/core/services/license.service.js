import {License} from "../../models/license";
import 'angular/global-store.service';

angular.module('graphdb.framework.core.services.licenseService', [])
    .service('$licenseService', ['$rootScope', 'LicenseRestService', '$translate', 'GlobalStoreService', licenseService]);

function licenseService($rootScope, LicenseRestService, $translate, GlobalStoreService) {

    let isLicenseHardcoded = false;
    let showLicense = false;
    let loadingLicense = false;
    let productType = undefined;
    let productTypeHuman = '';

    const subscriptions = [];

    // =========================
    // public function
    // =========================
    const checkLicenseStatus = () => {
        loadingLicense = true;
        LicenseRestService.getHardcodedLicense().success(function (res) {
            isLicenseHardcoded = (res === 'true');
        }).error(function () {
            isLicenseHardcoded = true;
        }).then(function () {
            LicenseRestService.getLicenseInfo().then(function (res) {
                const license = new License(res.data);
                GlobalStoreService.updateLicense(license);
                showLicense = true;
                loadingLicense = false;
            }, function () {
                GlobalStoreService.updateLicense(new License({
                    message: $translate.instant('no.license.set.msg'),
                    valid: false
                }));
                showLicense = true;
                loadingLicense = false;
            });
        });
    };

    const isLicenseValid = function () {
        const license = GlobalStoreService.getLicense();
        return license && license.valid;
    };

    // =========================
    // Private function
    // =========================

    const updateProductType = function (license) {
        // TODO check if this have to be translated.
        productType = license.productType;
        if (productType === "standard") {
            productTypeHuman = "Standard";
        } else if (productType === "enterprise") {
            productTypeHuman = "Enterprise";
        } else if (productType === "free") {
            productTypeHuman = "Free";
        } else if (productType === "graphdb") {
            productTypeHuman = "GraphDB";
        }
    };

    const removeAllListeners = () => {
        subscriptions.forEach((subscription) => subscription());
    };

    const init = () => {
        subscriptions.push(GlobalStoreService.onLicenseUpdated((license) => updateProductType(license)));
        checkLicenseStatus();
    };

    // Deregister the watcher when the scope/directive is destroyed
    $rootScope.$on('$destroy', removeAllListeners);

    init();

    return {
        isLicenseHardcoded,
        showLicense,
        loadingLicense,
        productType,
        productTypeHuman,
        isLicenseValid,
        checkLicenseStatus
    };
}
