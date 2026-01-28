import 'angular/core/services/security.service';
import {GRAPHQL, READ_REPO, WRITE_REPO} from '../services/constants';
import {UserType} from 'angular/utils/user-utils';
import {
    navigate,
    ThemeService,
    ApplicationSettingsStorageService,
    NavigationContextService,
    SecurityService,
    AuthenticationService,
    SecurityContextService,
    LicenseService,
    service,
    User,
} from '@ontotext/workbench-api';
import {CookiePolicyModalController} from '../../core/directives/cookie-policy/cookie-policy-modal-controller';

angular
    .module('graphdb.framework.security.controllers.user-settings', [
        'graphdb.framework.core.services.security-service',
    ])
    .controller('UserSettingsController', UserSettingsController);

UserSettingsController.$inject = [
    '$scope',
    'toastr',
    '$window',
    '$timeout',
    '$jwtAuth',
    '$rootScope',
    '$controller',
    'ModalService',
    '$translate',
    '$q',
    '$uibModal',
    'TrackingService',
];

function UserSettingsController($scope, toastr, $window, $timeout, $jwtAuth, $rootScope, $controller, ModalService, $translate, $q, $uibModal, TrackingService) {
    angular.extend(this, $controller('CommonUserCtrl', {$scope: $scope, passwordPlaceholder: 'security.new.password'}));

    // =========================
    // Private variables
    // =========================
    const securityService = service(SecurityService);
    const authenticationService = service(AuthenticationService);
    const securityContextService = service(SecurityContextService);
    const licenseService = service(LicenseService);

    const applicationSettingsStorageService = service(ApplicationSettingsStorageService);
    const navigationContextService = service(NavigationContextService);
    const themeService = service(ThemeService);

    /**
     * A timer task that will redirect back to the previous page after the user has been updated.
     * @type {Promise}
     */
    let waitBeforeRedirectBack;

    // =========================
    // Public variables
    // =========================

    $scope.mode = 'settings';
    $scope.showWorkbenchSettings = true;
    /**
     * @type {ApplicationSettings}
     */
    $scope.workbenchSettings = applicationSettingsStorageService.getApplicationSettings();
    $scope.selectedThemeMode = $scope.workbenchSettings.themeMode;
    $scope.saveButtonText = $translate.instant('common.save.btn');
    $scope.pageTitle = $translate.instant('view.settings.title');
    $scope.passwordPlaceholder = $translate.instant('security.new.password');
    $scope.grantedAuthorities = {
        [READ_REPO]: {},
        [WRITE_REPO]: {},
        [GRAPHQL]: {},
    };
    $scope.loader = false;
    /**
     * Allows to reset the password when updating the user.
     * @type {boolean}
     */
    $scope.noPassword = false;
    /**
     * If the button that opens the cookie policy modal should be visible or not.
     * @type {boolean}
     */
    $scope.showCookiePolicyLink = false;

    // =========================
    // Public functions
    // =========================

    $scope.hasEditRestrictions = function() {
        return true;
    };

    $scope.isUser = function() {
        return $scope.userType === UserType.USER;
    };

    $scope.goBack = function() {
        const previousRoute = navigationContextService.getPreviousRoute();
        navigate(previousRoute ?? './');
    };

    $scope.updateCurrentUserData = function() {
        authenticationService.getCurrentUser()
            .then((authenticatedUser) => securityContextService.updateAuthenticatedUser(authenticatedUser));
    };

    $scope.redirectAdmin = function() {
        if (!$scope.currentUserData) {
            $rootScope.redirectToLogin();
        }
    };

    $scope.submit = function() {
        if ($scope.noPassword && $scope.userType === UserType.ADMIN) {
            ModalService.openSimpleModal({
                title: $translate.instant('security.save.admin.settings'),
                message: $translate.instant('security.admin.pass.unset'),
                warning: true,
            }).result.then(function() {
                $scope.updateUser();
            });
        } else {
            $scope.updateUser();
        }
    };

    $scope.updateUserHttp = function() {
        $scope.loader = true;
        const user = new User({
            username: $scope.user.username,
            password: $scope.noPassword ? '' : $scope.user.password || undefined,
            appSettings: $scope.user.appSettings,
        });
        securityService.updateAuthenticatedUser(user)
            .then(() => {
                toastr.success($translate.instant('security.user.updated', {name: $scope.user.username}));
                $scope.updateCurrentUserData();
                themeService.setThemeMode($scope.selectedThemeMode);
                applicationSettingsStorageService.setApplicationSettings($scope.workbenchSettings);
                goBackToPreviousView();
            }).catch((data) => {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
            })
            .finally(() => {
                $scope.loader = false;
            });
    };

    $scope.updateUser = function() {
        if (!$scope.validateForm()) {
            return false;
        }
        $scope.updateUserHttp();
    };

    $scope.validateForm = function() {
        return $scope.validatePassword();
    };

    $scope.setThemeMode = function() {
        $scope.selectedThemeMode = $scope.workbenchSettings.themeMode;
    };

    $scope.showCookiePolicy = ($event) => {
        // The button that triggers this handler is inside a form which has a submit property,
        // and we need to prevent that because it leads to a redirect to the home page.
        $event.preventDefault();

        $uibModal.open({
            templateUrl: 'js/angular/core/templates/cookie-policy/cookie-policy.html',
            controller: CookiePolicyModalController,
            backdrop: 'static',
            keyboard: false,
            windowClass: 'cookie-policy-modal',
            resolve: {
                data: () => {
                    return TrackingService.getCookieConsent()
                        .then((consent) => {
                            return {
                                cookieConsent: consent,
                            };
                        });
                    },
                },
            })
            // If the modal returns `shouldReload` as true, we reload the page.
            // Reloading is crucial here due to potential memory leaks that arise from dynamically
            // adding and removing Google Tag Manager (GTM) scripts based on the user's consent choice.
            // See the comments within `CookiePolicyModalController`.
            .result.then((shouldReload) => {
            if (shouldReload) {
                $window.location.reload();
            }
        });
    };

    // =========================
    // Private functions
    // =========================

     const showCookiePolicyLink = () => {
         licenseService.updateLicenseStatus().then(() => {
            $scope.showCookiePolicyLink = TrackingService.isTrackingAllowed();
        });
    };

    const goBackToPreviousView = () => {
        waitBeforeRedirectBack = $timeout(function() {
            $scope.loader = false;
            $window.history.back();
        }, 2000);
    };

    const initUserData = function() {
        // Copy needed so that Cancel would work correctly, need to call updateCurrentUserData on OK
        $scope.user = {username: $scope.currentUserData.username};
        $scope.user.password = '';
        $scope.user.confirmpassword = '';
        $scope.user.external = $scope.currentUserData.external;
        $scope.user.appSettings = $scope.currentUserData.appSettings;
        // For backward compatibility
        if ($scope.user.appSettings['DEFAULT_VIS_GRAPH_SCHEMA'] === undefined) {
            $scope.user.appSettings['DEFAULT_VIS_GRAPH_SCHEMA'] = true;
        }
        $scope.userType = $scope.currentUserData.getUserType();
        $scope.grantedAuthorities = $scope.currentUserData.authorities.toUIModel();
        $scope.customRoles = $scope.currentUserData.authorities.getCustomRoles();
    };

    const processUser = () => {
        const principal = securityContextService.getAuthenticatedUser();
        $scope.currentUserData = principal.toUser();
        $scope.redirectAdmin();
        initUserData();
    };

    // =========================
    // Subscriptions
    // =========================

    $scope.$on('$destroy', function() {
        $timeout.cancel(waitBeforeRedirectBack);
    });

    // =========================
    // Initialization
    // =========================

    const initView = () => {
        processUser();
        $scope.setThemeMode();
        showCookiePolicyLink();
    };

    initView();
}
