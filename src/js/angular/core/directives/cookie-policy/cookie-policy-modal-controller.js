import {ConsentTypes, CookieConsent} from "../../../models/cookie-policy/cookie-consent";

CookiePolicyModalController.$inject = ['$scope', '$jwtAuth', '$translate', 'toastr'];

/**
 * Controller for managing cookie consent settings in a modal.
 * Handles toggling and saving user consent preferences for different cookie types.
 *
 * @param {Object} $scope - AngularJS scope for managing modal variables and functions.
 * @param {Object} $jwtAuth - Service for handling user authentication and data.
 * @param {Object} $translate - Service for translating messages.
 * @param {Object} toastr - Service for displaying toast notifications.
 */
export function CookiePolicyModalController($scope, $jwtAuth, $translate, toastr) {
    // =========================
    // Public variables
    // =========================
    $scope.appSettings = undefined;
    $scope.username = undefined;
    $scope.ConsentTypes = ConsentTypes;

    // =========================
    // Private variables
    // =========================
    let username = undefined;

    // =========================
    // Public functions
    // =========================
    $scope.toggleConsent = (type) => {
        if (type === ConsentTypes.STATISTIC) {
            $scope.appSettings.COOKIE_CONSENT.statistic = !$scope.appSettings.COOKIE_CONSENT.statistic;
        } else if (type === ConsentTypes.THIRD_PARTY) {
            $scope.appSettings.COOKIE_CONSENT.thirdParty = !$scope.appSettings.COOKIE_CONSENT.thirdParty;
        }
        $scope.saveConsent();
    };

    $scope.saveConsent = () => {
        $jwtAuth.updateUserData({appSettings: $scope.appSettings, username})
            .catch((error) => {
                const msg = getError(error.data, error.status);
                toastr.error(msg, $translate.instant('common.error'));
            });
    };

    $scope.close = () => {
        $scope.$close($scope.appSettings);
    };

    // =========================
    // Private functions
    // =========================
    const init = () => {
        $jwtAuth.getPrincipal()
            .then((data) => {
                $scope.appSettings = data.appSettings;
                username = data.username;
                $scope.appSettings.COOKIE_CONSENT = CookieConsent.fromJSON($scope.appSettings.COOKIE_CONSENT).getConsent();
            })
            .catch((error) => {
                const msg = getError(error.data, error.status);
                toastr.error(msg, $translate.instant('common.error'));
            });
    };

    // =========================
    // Initialization
    // =========================
    init();
}
