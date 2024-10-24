const modules = [];

angular
    .module('graphdb.framework.core.directives.cookie-consent', modules)
    .directive('cookieConsent', cookieConsent);

cookieConsent.$inject = ['$jwtAuth', '$uibModal', '$licenseService', '$translate', 'toastr'];

function cookieConsent($jwtAuth, $uibModal, $licenseService, $translate, toastr) {
    return {
        restrict: 'E',
        templateUrl:'js/angular/core/templates/cookie-policy/cookie-consent.html',
        link: ($scope) => {
            // =========================
            // Public variables
            // =========================
            $scope.showCookieConsent = false;

            // =========================
            // Private variables
            // =========================
            let appSettings = undefined;
            let username = undefined;

            // =========================
            // Public functions
            // =========================
            $scope.acceptConsent = () => {
                appSettings.COOKIE_CONSENT = true;
                $jwtAuth.updateUserData({appSettings, username}).finally(() => $scope.showCookieConsent = false);
            };

            $scope.showCookiePolicy = () => {
                $scope.showCookieConsent = false;
                $uibModal.open({
                    templateUrl: 'js/angular/core/templates/cookie-policy/cookie-policy.html',
                    controller: ['$scope', function ($scope) {
                        $scope.close = () => {
                            $scope.$close(false);
                        };
                    }],
                    backdrop: 'static',
                    windowClass: 'cookie-policy-modal',
                    keyboard: false
                }).result.then(() => $scope.acceptConsent());
            };

            // =========================
            // Private functions
            // =========================
            const init = () => {
                $licenseService.checkLicenseStatus().then(() => {
                    if ($licenseService.isTrackingAllowed()) {
                        return $jwtAuth.getPrincipal();
                    }
                }).then((data) => {
                    if (!data) {
                        return;
                    }
                    appSettings = data.appSettings;
                    username = data.username;

                    if (!appSettings.COOKIE_CONSENT) {
                        $scope.showCookieConsent = true;
                    }
                }).catch((error) => {
                    const msg = getError(error.data, error.status);
                    toastr.error(msg, $translate.instant('common.error'));
                });
            };

            // =========================
            // Initialization
            // =========================
            init();
        }
    };
}
