import 'angular/core/services';
import 'angular/core/services/jwt-auth.service';

angular
    .module('graphdb.framework.settings.controllers', [
        'ngCookies',
        'ui.bootstrap',
        'graphdb.framework.core.services.jwtauth',
        'toastr'
    ])
    .controller('ActiveLocationSettingsCtrl', ActiveLocationSettingsCtrl)
    .controller('ValidateLicenseModalCtrl', ValidateLicenseModalCtrl)
    .controller('LicenseCtrl', LicenseCtrl)
    .controller('RegisterLicenseCtrl', RegisterLicenseCtrl)
    .controller('LoaderSamplesCtrl', LoaderSamplesCtrl);

ActiveLocationSettingsCtrl.$inject = ['$scope', 'toastr', '$uibModalInstance', 'LicenseRestService', '$translate'];

function ActiveLocationSettingsCtrl($scope, toastr, $uibModalInstance, LicenseRestService, $translate) {
    $scope.supportsStatistics = true;
    $scope.settings = {statistics: false};
    $scope.getSettings = getSettings;

    function getSettings() {
        $scope.loader = true;
        LicenseRestService.getStatistics().then(function (response) {
            $scope.settings.statistics = response.data === 'true';
            $scope.supportsStatistics = true;
        }, function (response) {
            if (response.status === 404) {
                $scope.supportsStatistics = false;
            } else {
                const msg = getError(response.data);
                toastr.error(msg, $translate.instant('error.getting.settings'));
            }
        });
    }

    $scope.getSettings();

    $scope.setSettings = function () {
        $scope.loader = true;
        LicenseRestService.toggleStatistics($scope.settings.statistics).then(function () {
            $uibModalInstance.close();
            toastr.success($translate.instant('saving.settings.success'));
        }, function (response) {
            const msg = getError(response.data);
            toastr.error(msg, $translate.instant('saving.settings.error'));
        });
    };

    $scope.submitForm = function () {
        $scope.setSettings();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

LicenseCtrl.$inject = ['$scope', 'LicenseRestService', '$licenseService', 'toastr', '$rootScope', 'ModalService', '$translate', 'TrackingService'];

function LicenseCtrl($scope, LicenseRestService, $licenseService, toastr, $rootScope, ModalService, $translate, TrackingService) {

    $scope.loadingLicense = function() {
        return $licenseService.loadingLicense();
    };

    // TODO - Check if redundant call and remove
    $licenseService.checkLicenseStatus();

    $scope.revertToFree = function () {
        ModalService.openSimpleModal({
            title: $translate.instant('confirm.operation'),
            message: $translate.instant("revert.to.free.warning.msg"),
            warning: true
        }).result
            .then(function () {
                LicenseRestService.unregisterLicense()
                    .success(function () {
                        $licenseService.checkLicenseStatus().then(() => TrackingService.init());
                    });
            });
    };
}

RegisterLicenseCtrl.$inject = ['$scope', 'LicenseRestService', '$location', '$uibModal', 'toastr', '$window', '$jwtAuth', '$translate'];

function RegisterLicenseCtrl($scope, LicenseRestService, $location, $uibModal, toastr, $window, $jwtAuth, $translate) {
    $scope.$on('securityInit', function () {
        if (!$jwtAuth.isAdmin()) {
            $location.path('/license');
        }
    });

    $scope.sendLicenseToValidateAndActivate = sendLicenseToValidateAndActivate;

    const textAreaSel = $('.license-textarea');

    // watch for uploaded license file
    $scope.$watch('currentFile', function () {
        if ($scope.currentFile) {
            const file = $scope.currentFile;
            LicenseRestService.extractFromLicenseFile(file)
                .success(function (licenseCode) {
                    sendLicenseToValidateAndActivate(licenseCode);
                }).error(function () {
                    toastr.error($translate.instant('could.not.upload.file.error'));
                });
        }
    });

    $scope.getBackToPreviousPage = function () {
        $window.history.back();
    };

    // send license code for validation and activation
    function sendLicenseToValidateAndActivate(licenseCode) {
        LicenseRestService.sendLicenseToValidate(licenseCode)
            .success(function (validatedLicense) {
                if (validatedLicense.licensee !== 'Invalid') {
                    // write code to textarea
                    textAreaSel.val(licenseCode);
                    // pop dialog for license details confirmation
                    confirmWantedNewLicenseDetails(validatedLicense, licenseCode);
                } else {
                    // clear textarea on invalid license
                    textAreaSel.val('');
                    // show error
                    toastr.error(validatedLicense.message);
                }
            })
            .error(function () {
                toastr.error($translate.instant('invalid.license'));
            });
    }


    // pops a modal dialog which asks you if your expected license details are correct
    // and sends license to GraphDB upon confirmation
    function confirmWantedNewLicenseDetails(license, licenseCode) {
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/settings/modal/validate-license.html',
            controller: 'ValidateLicenseModalCtrl',
            size: 'lg',
            resolve: {
                license: function () {
                    return license;
                }
            }
        });

        modalInstance.result.then(function () {
            registerLicense(licenseCode);
        });
    }

    // send license code to GraphDB for activation
    function registerLicense(licenseCode) {
        if (!licenseCode) {
            licenseCode = textAreaSel.val();
        }

        if (licenseCode) {
            // replacing whitespace makes this work on Safari too,
            // whereas other browser happily ignore the whitespace
            const decodedLicense = atob(licenseCode.replace(/\s/g, ''));
            LicenseRestService.registerLicense(decodedLicense)
                .success(function () {
                    $window.history.back();
                }).error(function () {
                    toastr.error($translate.instant('license.register.error'));
                });
        } else {
            toastr.error($translate.instant('no.license.code.error'));
        }
    }
}

ValidateLicenseModalCtrl.$inject = ['$scope', '$uibModalInstance', 'license'];

function ValidateLicenseModalCtrl($scope, $uibModalInstance, license) {
    $scope.ok = ok;
    $scope.cancel = cancel;
    $scope.license = license;

    function ok() {
        $uibModalInstance.close();
    }

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    }
}

LoaderSamplesCtrl.$inject = ['$scope'];

function LoaderSamplesCtrl($scope) {
    $scope.loader = true;
    $scope.setLoader = function (loader) {
        $scope.loader = loader;
    };
}
