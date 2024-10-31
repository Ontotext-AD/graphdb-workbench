import {CookieConsent} from "../../../models/cookie-policy/cookie-consent";
import {CookiePolicyModalController} from "./cookie-policy-modal-controller";

const modules = [];

angular
    .module('graphdb.framework.core.directives.cookie-consent', modules)
    .directive('cookieConsent', cookieConsent);

cookieConsent.$inject = ['$jwtAuth', '$uibModal', '$licenseService', '$translate', 'toastr'];

function cookieConsent($jwtAuth, $uibModal, $licenseService, $translate, toastr) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/core/templates/cookie-policy/cookie-consent.html',
        link: ($scope) => {
            // =========================
            // Public variables
            // =========================
            $scope.showCookieConsent = false;

            // =========================
            // Public functions
            // =========================
            $scope.acceptConsent = () => {
                $jwtAuth.getPrincipal()
                    .then((data) => {
                        const appSettings = data.appSettings;
                        const username = data.username;
                        appSettings.COOKIE_CONSENT = CookieConsent.fromJSON(appSettings.COOKIE_CONSENT).getConsent();
                        appSettings.COOKIE_CONSENT.policyAccepted = true;
                        return $jwtAuth.updateUserData({appSettings, username});
                    })
                .finally(() => $scope.showCookieConsent = false);
            };

            $scope.showCookiePolicy = () => {
                $uibModal.open({
                    templateUrl: 'js/angular/core/templates/cookie-policy/cookie-policy.html',
                    controller: CookiePolicyModalController,
                    windowClass: 'cookie-policy-modal'
                });
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
                    const appSettings = data.appSettings;
                    appSettings.COOKIE_CONSENT = CookieConsent.fromJSON(appSettings.COOKIE_CONSENT).getConsent();
                    if (!appSettings.COOKIE_CONSENT.policyAccepted) {
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
