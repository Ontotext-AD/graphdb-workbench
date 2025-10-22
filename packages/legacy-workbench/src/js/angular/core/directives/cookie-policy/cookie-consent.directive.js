import {CookiePolicyModalController} from "./cookie-policy-modal-controller";
import {
    AuthenticationService,
    SecurityContextService,
    service
} from "@ontotext/workbench-api";

const modules = [];

angular
    .module('graphdb.framework.core.directives.cookie-consent', modules)
    .directive('cookieConsent', cookieConsent);

cookieConsent.$inject = ['$jwtAuth', '$uibModal', '$translate', 'toastr', 'TrackingService'];

function cookieConsent($jwtAuth, $uibModal, $translate, toastr, TrackingService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/core/templates/cookie-policy/cookie-consent.html',
        link: ($scope) => {
            // =========================
            // Private variables
            // =========================
            let cookieConsent = undefined;
            const securityContextService = service(SecurityContextService);
            const authenticationService = service(AuthenticationService);

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
                    windowClass: 'cookie-policy-modal',
                    resolve: {
                        data: () => {
                            return {
                                cookieConsent
                            }
                        }
                    }
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

            const onUserChanged = () => {
                const userLoggedIn = authenticationService.isLoggedIn();
                if (userLoggedIn) {
                    init();
                } else {
                    $scope.showCookieConsent = false;
                }
            };

            // =========================
            // Subscriptions
            // =========================
            const onUserChangedSubscription = securityContextService.onAuthenticatedUserChanged(onUserChanged);

            $scope.$on('$destroy', () => {
                onUserChangedSubscription();
            });

            // =========================
            // Initialization
            // =========================
            init();
        }
    };
}
