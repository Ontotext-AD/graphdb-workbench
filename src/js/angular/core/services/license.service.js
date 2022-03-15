angular.module('graphdb.framework.core.services.licenseService', [])
    .service('$licenseService', ['$rootScope', 'LicenseRestService', '$translate', licenseService]);

function licenseService($rootScope, LicenseRestService, $translate) {

    const that = this;

    this.checkLicenseStatus = function () {
        that.loadingLicense = true;
        LicenseRestService.getHardcodedLicense().success(function (res) {
            that.isLicenseHardcoded = (res === 'true');
        }).error(function () {
            that.isLicenseHardcoded = true;
        }).then(function () {
            LicenseRestService.getLicenseInfo().then(function (res) {
                that.license = res.data;
                that.showLicense = true;
                that.loadingLicense = false;
                updateProductType(that.license);
            }, function () {
                that.license = {message: $translate.instant('no.license.set.msg'), valid: false};
                that.showLicense = true;
                that.loadingLicense = false;
                updateProductType(that.license);
            });
        });
    };

    const updateProductType = function (license) {
        that.productType = license.productType;
        if (that.productType === "standard") {
            that.productTypeHuman = "Standard";
        } else if (that.productType === "enterprise") {
            that.productTypeHuman = "Enterprise";
        } else if (that.productType === "free") {
            that.productTypeHuman = "Free";
        } else if (that.productType === "graphdb") {
            that.productTypeHuman = "GraphDB";
        }
    };

    this.checkLicenseStatus();

    this.isLicenseValid = function() {
        return that.license && that.license.valid;
    }
}
