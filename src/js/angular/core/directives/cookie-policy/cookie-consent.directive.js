import {CookiePolicyModalController} from "./cookie-policy-modal-controller";

const modules = [];

angular
    .module('graphdb.framework.core.directives.cookie-consent', modules)
    .directive('cookieConsent', cookieConsent);

cookieConsent.$inject = ['$jwtAuth', '$uibModal', '$licenseService', '$translate', 'toastr', 'TrackingService'];

function cookieConsent($jwtAuth, $uibModal, $licenseService, $translate, toastr, TrackingService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/core/templates/cookie-policy/cookie-consent.html',
        link: ($scope) => {
            // =========================
            // Private variables
            // =========================
            let cookieConsent = undefined;

            // =========================
            // Public variables
            // =========================
            $scope.showCookieConsent = false;

            // =========================
            // Public functions
            // =========================
            $scope.acceptConsent = () => {
                TrackingService.updateCookieConsent(cookieConsent.setPolicyAccepted(true))
                    .then(() => $scope.showCookieConsent = false);
            };

            $scope.showCookiePolicy = () => {
                $uibModal.open({
                    templateUrl: 'js/angular/core/templates/cookie-policy/cookie-policy.html',
                    controller: CookiePolicyModalController,
                    backdrop: 'static',
                    keyboard: false,
                    windowClass: 'cookie-policy-modal'
                });
            };

            // =========================
            // Private functions
            // =========================
            const init = () => {
                TrackingService.getCookieConsent()
                    .then((consent) => {
                        cookieConsent = consent;
                        $scope.showCookieConsent = !consent.getPolicyAccepted();
                    })
                    .catch((error) => {
                        const msg = getError(error.data, error.status);
                        toastr.error(msg, $translate.instant('common.error'));
                    });
            };

            const securityInit = (event, securityEnabled, userLoggedIn) => {
                if (userLoggedIn) {
                    init();
                } else {
                    $scope.showCookieConsent = false;
                }
            };

            // =========================
            // Subscriptions
            // =========================
            const securityInitListener = $scope.$on('securityInit', securityInit);

            $scope.$on('$destroy', () => {
                securityInitListener();
            });

            // =========================
            // Initialization
            // =========================
            init();
        }
    };
}
