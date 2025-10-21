import 'angular/core/services';
import 'angular/core/services/jwt-auth.service';
import {
    AuthorizationService,
    LicenseService,
    LicenseContextService,
    service,
    RoutingUtil,
    NavigationContextService,
    navigate,
} from '@ontotext/workbench-api';

angular
    .module('graphdb.framework.settings.controllers', [
        'ngCookies',
        'ui.bootstrap',
        'graphdb.framework.core.services.jwtauth',
        'toastr',
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
        LicenseRestService.getStatistics().then(function(response) {
            $scope.settings.statistics = response.data === 'true';
            $scope.supportsStatistics = true;
        }, function(response) {
            if (response.status === 404) {
                $scope.supportsStatistics = false;
            } else {
                const msg = getError(response.data);
                toastr.error(msg, $translate.instant('error.getting.settings'));
            }
        });
    }

    $scope.getSettings();

    $scope.setSettings = function() {
        $scope.loader = true;
        LicenseRestService.toggleStatistics($scope.settings.statistics).then(function() {
            $uibModalInstance.close();
            toastr.success($translate.instant('saving.settings.success'));
        }, function(response) {
            const msg = getError(response.data);
            toastr.error(msg, $translate.instant('saving.settings.error'));
        });
    };

    $scope.submitForm = function() {
        $scope.setSettings();
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}

LicenseCtrl.$inject = ['$scope', 'toastr', '$rootScope', 'ModalService', '$translate', 'TrackingService'];

function LicenseCtrl($scope, toastr, $rootScope, ModalService, $translate, TrackingService) {
    // =========================
    // Private variables
    // =========================
    const licenseService = service(LicenseService);
    const licenseContextService = service(LicenseContextService);

    // =========================
    // Public variables
    // =========================
    $scope.isLicenseHardcoded = true;

    $scope.removeLicense = function() {
        ModalService.openSimpleModal({
            title: $translate.instant('confirm.operation'),
            message: $translate.instant('remove.license.warning.msg'),
            warning: true,
        }).result
            .then(() => licenseService.unregisterLicense())
            .then(() => licenseService.updateLicenseStatus())
            .then(() => TrackingService.applyTrackingConsent())
            .catch((error) => {
                const msg = getError(error.data, error.status);
                toastr.error(msg, $translate.instant('common.error'));
            });
    };

    const onIsLicenseHardcodedUpdated = (isLicenseHardcoded) => $scope.isLicenseHardcoded = isLicenseHardcoded;
    const isLicenseHardcodedUpdatedSubscription = licenseContextService.onIsLicenseHardcodedChanged(onIsLicenseHardcodedUpdated);

    $scope.$on('$destroy', () => {
        isLicenseHardcodedUpdatedSubscription?.();
    });
}

RegisterLicenseCtrl.$inject = ['$scope', '$location', '$uibModal', 'toastr', '$window', '$jwtAuth', '$translate'];

function RegisterLicenseCtrl($scope, $location, $uibModal, toastr, $window, $jwtAuth, $translate) {
    // =========================
    // Private variables
    // =========================
    const authorizationService = service(AuthorizationService);
    const licenseService = service(LicenseService);

    // =========================
    // Public variables
    // =========================
    $scope.isLicenseHardcodedValue = true;

    const validateAdminOrRedirect = () => {
        if (!authorizationService.isAdmin()) {
            RoutingUtil.navigate('license');
        }
    };

    validateAdminOrRedirect();

    $scope.validateLicenseCode = (licenseCode) => {
        validateAndActivateLicense(licenseCode);
    };

    const textAreaSel = $('.license-textarea');

    // watch for uploaded license file
    $scope.$watch('currentFile', function() {
        if ($scope.currentFile) {
            const file = $scope.currentFile;
            licenseService.extractFromLicenseFile(file)
                .then((licenseCode) => {
                    validateAndActivateLicense(licenseCode);
                })
                .catch((() => {
                    toastr.error($translate.instant('could.not.upload.file.error'));
                }));
        }
    });

    $scope.getBackToPreviousPage = function() {
        $window.history.back();
    };

    // send license code for validation and activation
    const validateAndActivateLicense = (licenseCode) => {
        licenseService.validateLicense(licenseCode)
            .then((license) => {
                if (license.present) {
                    // write code to textarea
                    textAreaSel.val(licenseCode);
                    // pop dialog for license details confirmation
                    confirmWantedNewLicenseDetails(license, licenseCode);
                } else {
                    // clear textarea on invalid license
                    textAreaSel.val('');
                    // show error
                    toastr.error(license.message);
                }
            })
            .catch(() => {
                toastr.error($translate.instant('invalid.license'));
            });
    };

    // pops a modal dialog which asks you if your expected license details are correct
    // and sends license to GraphDB upon confirmation
    function confirmWantedNewLicenseDetails(license, licenseCode) {
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/settings/modal/validate-license.html',
            controller: 'ValidateLicenseModalCtrl',
            size: 'lg',
            resolve: {
                license: function() {
                    return license;
                },
            },
        });

        modalInstance.result.then(function() {
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
            licenseService.registerLicense(decodedLicense)
                .then(() => {
                    const previousRoute = service(NavigationContextService).getPreviousRoute();
                    navigate(previousRoute ?? './');
                })
                .catch((error) => {
                    const msg = getError(error);
                    toastr.error(msg, $translate.instant('license.register.error'));
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
    $scope.setLoader = function(loader) {
        $scope.loader = loader;
    };
}
