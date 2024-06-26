import {ConsentTypes} from "../../../models/cookie-policy/cookie-consent";

CookiePolicyModalController.$inject = ['$scope', '$translate', 'toastr', 'TrackingService'];

/**
 * Controller for managing cookie consent settings in a modal.
 * Handles toggling and saving user consent preferences for different cookie types.
 *
 * @param {Object} $scope - AngularJS scope for managing modal variables and functions.
 * @param {Object} $translate - Service for translating messages within the modal.
 * @param {Object} toastr - Service for displaying toast notifications.
 * @param {Object} TrackingService - Service responsible for tracking and managing consent data.
 */
export function CookiePolicyModalController($scope, $translate, toastr, TrackingService) {
    let callCount = 0;
    // =========================
    // Public variables
    // =========================
    $scope.cookieConsent = undefined;
    $scope.ConsentTypes = ConsentTypes;

    // =========================
    // Public functions
    // =========================
    $scope.toggleConsent = (type) => {
        if (type === ConsentTypes.STATISTIC) {
            $scope.cookieConsent.setStatisticConsent(!$scope.cookieConsent.getStatisticConsent());
        } else if (type === ConsentTypes.THIRD_PARTY) {
            callCount++;
            $scope.cookieConsent.setThirdPartyConsent(!$scope.cookieConsent.getThirdPartyConsent());

        }
        $scope.saveConsent();
    };

    $scope.saveConsent = () => {
        TrackingService.updateCookieConsent($scope.cookieConsent);
    };

    /**
     * Closes the modal and passes a result to indicate if the page should be reloaded.
     *  - The page reloads only if the user has
     *    (1) toggled third-party consent multiple times (`didAbusedThirdPartyToggle`),
     *    (2) left third-party consent as enabled (`hasThirdPartyConsent`), and
     *    (3) previously accepted the overall policy (`hasPolicyAccepted`)
     *  - This reload is necessary in cases where multiple third-party consent changes
     *    lead to duplicate and redundant tracking data being loaded.
     */
    $scope.close = () => {
        const didAbusedThirdPartyToggle = callCount > 1;
        const hasThirdPartyConsent = $scope.cookieConsent.getThirdPartyConsent();
        const hasPolicyAccepted = $scope.cookieConsent.getPolicyAccepted();

        $scope.$close(didAbusedThirdPartyToggle && hasThirdPartyConsent && hasPolicyAccepted);
    };

    // =========================
    // Private functions
    // =========================
    const init = () => {
        TrackingService.getCookieConsent()
            .then((cookieConsent) => $scope.cookieConsent = cookieConsent)
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
