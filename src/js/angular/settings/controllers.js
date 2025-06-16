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

ActiveLocationSettingsCtrl.$inject = ['$scope', 'toastr', '$uibModalInstance', 'LicenseRestService'];

function ActiveLocationSettingsCtrl($scope, toastr, $uibModalInstance, LicenseRestService) {
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
                toastr.error(msg, 'Error getting settings');
            }
        });
    }

    $scope.getSettings();

    $scope.setSettings = function () {
        $scope.loader = true;
        LicenseRestService.toggleStatistics($scope.settings.statistics).then(function () {
            $uibModalInstance.close();
            toastr.success('Settings have been saved');
        }, function (response) {
            const msg = getError(response.data);
            toastr.error(msg, 'Error saving settings');
        });
    };

    $scope.submitForm = function () {
        $scope.setSettings();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

LicenseCtrl.$inject = ['$scope', 'LicenseRestService', 'toastr', '$rootScope'];

function LicenseCtrl($scope, LicenseRestService, toastr, $rootScope) {
    $scope.loader = true;

    LicenseRestService.checkLicenseHardcoded()
        .success(function (res) {
            $rootScope.isLicenseHardcoded = (res === 'true');
        })
        .error(function () {
            $rootScope.isLicenseHardcoded = false;
            toastr.error('Error checking license availability');
        })
        .then(function () {
            LicenseRestService.getLicenseInfo()
                .success(function (res) {
                    $scope.loader = false;
                    $scope.license = res;
                    // check if you have a hardcoded license that is not activated through the workbench and if
                    // you do disable ability to update license
                })
                .error(function () {
                    // no license but we need to check for 417
                    $scope.loader = false;
                    $scope.license = {message: 'No license was set.', valid: false};
                });
        });
}

RegisterLicenseCtrl.$inject = ['$scope', 'LicenseRestService', '$location', '$uibModal', 'toastr', '$window', '$jwtAuth'];

function RegisterLicenseCtrl($scope, LicenseRestService, $location, $uibModal, toastr, $window, $jwtAuth) {
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
                    toastr.error('Could not upload file');
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
                toastr.error('Invalid license');
            });
    }


    // pops a modal dialog which asks you if your expected license details are correct
    // and sends license to GraphDB upon confirmation
    function confirmWantedNewLicenseDetails(license, licenseCode) {
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/settings/modal/validate-license.html',
            controller: 'ValidateLicenseModalCtrl',
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
                    toastr.error('Error registering GraphDB license');
                });
        } else {
            toastr.error('No license code available in textarea');
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
