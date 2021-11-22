angular.module('graphdb.framework.core.services.licenseService', [])
    .service('$licenseService', ['$rootScope', 'LicenseRestService', licenseService]);

function licenseService($rootScope, LicenseRestService) {

    const that = this;

    const getLicenseInfo = function () {
        LicenseRestService.getHardcodedLicense().success(function (res) {
            that.isLicenseHardcoded = (res === 'true');
        }).error(function () {
            that.isLicenseHardcoded = true;
        }).then(function () {
            LicenseRestService.getLicenseInfo().then(function (res) {
                that.license = res.data;
                // that.showLicense = true;
                //$scope.updateProductType($scope.license);
            }, function () {
                that.license = {message: 'No license was set.', valid: false};
                // $scope.showLicense = true;
                //$scope.updateProductType($scope.license);
            });
        });
    };

    getLicenseInfo();

    this.isLicenseValid = function() {
        return this.license && this.license.valid;
    }

    const updateProductType = function (license) {
        that.productType = license.productType;
        if (that.productType === "standard") {
            that.productTypeHuman = "Standard";
            that.documentation = "standard/";
        } else if (that.productType === "enterprise") {
            that.productTypeHuman = "Enterprise";
            that.documentation = "enterprise/";
        } else if (that.productType === "free") {
            that.productTypeHuman = "Free";
            that.documentation = "free/";
        }
        that.mainTitle = that.productTypeHuman;
    };

}
