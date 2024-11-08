import 'angular/core/services/security.service';
import {READ_REPO, WRITE_REPO} from "../services/constants";
import {UserType} from 'angular/utils/user-utils';
import {parseAuthorities} from "../services/authorities-util";
import {UpdateUserPayload} from "../../models/security/security";
import {CookiePolicyModalController} from "../../core/directives/cookie-policy/cookie-policy-modal-controller";

angular
    .module('graphdb.framework.security.controllers.user-settings', [
        'graphdb.framework.core.services.security-service'
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
    'SecurityService',
    'ModalService',
    '$translate',
    'ThemeService',
    'WorkbenchSettingsStorageService',
    '$q',
    '$uibModal',
    '$licenseService',
    'TrackingService'
];

function UserSettingsController($scope, toastr, $window, $timeout, $jwtAuth, $rootScope, $controller, SecurityService, ModalService, $translate, ThemeService, WorkbenchSettingsStorageService, $q, $uibModal, $licenseService, TrackingService) {
    angular.extend(this, $controller('CommonUserCtrl', {$scope: $scope, passwordPlaceholder: 'security.new.password'}));

    // =========================
    // Private variables
    // =========================

    /**
     * A timer task that will redirect back to the previous page after the user has been updated.
     * @type {Promise}
     */
    let waitBeforeRedirectBack;

    // =========================
    // Public variables
    // =========================

    $scope.themes = ThemeService.getThemes();
    $scope.mode = 'settings';
    $scope.showWorkbenchSettings = true;
    /**
     * @type {WorkbenchSettingsModel}
     */
    $scope.workbenchSettings = WorkbenchSettingsStorageService.getWorkbenchSettings();
    $scope.selectedThemeMode = $scope.workbenchSettings.mode;
    $scope.saveButtonText = $translate.instant('common.save.btn');
    $scope.pageTitle = $translate.instant('view.settings.title');
    $scope.passwordPlaceholder = $translate.instant('security.new.password');
    $scope.grantedAuthorities = {
        [READ_REPO]: {},
        [WRITE_REPO]: {}
    };
    $scope.loader = false;
    /**
     * @type {ThemeModel}
     */
    $scope.selectedTheme = ThemeService.getTheme();
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

    $scope.hasEditRestrictions = function () {
        return true;
    };

    $scope.isUser = function () {
        return $scope.userType === UserType.USER;
    };

    $scope.goBack = function () {
        const timer = $timeout(function () {
            $window.history.back();
        }, 100);
        $scope.$on('$destroy', function () {
            $timeout.cancel(timer);
        });
    };

    $scope.getPrincipal = function () {
        return $jwtAuth.getPrincipal()
            .then((principal) => {
                $scope.currentUserData = _.cloneDeep(principal);
                $scope.redirectAdmin();
                initUserData($scope);
            });
    };

    $scope.updateCurrentUserData = function () {
        // Using $q.when to proper set values in view
        $q.when($jwtAuth.getPrincipal())
            .then((principal) => _.assign(principal, $scope.userData));
    };

    $scope.redirectAdmin = function () {
        if (!$scope.currentUserData) {
            $rootScope.redirectToLogin();
        }
    };

    $scope.submit = function () {
        if ($scope.noPassword && $scope.userType === UserType.ADMIN) {
            ModalService.openSimpleModal({
                title: $translate.instant('security.save.admin.settings'),
                message: $translate.instant('security.admin.pass.unset'),
                warning: true
            }).result.then(function () {
                $scope.updateUser();
            });
        } else {
            $scope.updateUser();
        }
    };

    $scope.updateUserHttp = function () {
        $scope.loader = true;
        const payload = new UpdateUserPayload({
            username: $scope.user.username,
            pass: ($scope.noPassword) ? '' : $scope.user.password || undefined,
            appSettings: $scope.user.appSettings
        });
        SecurityService.updateUserData(payload)
            .then(() => {
                toastr.success($translate.instant('security.user.updated', {name: $scope.user.username}));
                $scope.updateCurrentUserData();
                ThemeService.toggleThemeMode($scope.selectedThemeMode);
                WorkbenchSettingsStorageService.saveWorkbenchSettings($scope.workbenchSettings);
                goBackToPreviousView();
            }).catch((data) => {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
            })
            .finally(() => {
                $scope.loader = false;
            });
    };

    $scope.updateUser = function () {
        if (!$scope.validateForm()) {
            return false;
        }
        $scope.updateUserHttp();
    };

    $scope.validateForm = function () {
        return $scope.validatePassword();
    };

    $scope.setThemeMode = function () {
        $scope.selectedThemeMode = $scope.workbenchSettings.mode;
    };

    /**
     * @param {{name: string, label: string}} theme
     */
    $scope.setTheme = (theme) => {
        $scope.selectedTheme = theme;
        $scope.workbenchSettings.theme = theme.name;
        ThemeService.applyTheme(theme.name);
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
            windowClass: 'cookie-policy-modal'
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
        $licenseService.checkLicenseStatus().then(() => {
            $scope.showCookiePolicyLink = TrackingService.isTrackingAllowed();
        });
    };

    const goBackToPreviousView = () => {
        waitBeforeRedirectBack = $timeout(function () {
            $scope.loader = false;
            $window.history.back();
        }, 2000);
    };

    const initUserData = function (scope) {
        // Copy needed so that Cancel would work correctly, need to call updateCurrentUserData on OK
        scope.userData = _.cloneDeep(scope.currentUserData);
        scope.user = {username: scope.userData.username};
        scope.user.password = '';
        scope.user.confirmpassword = '';
        scope.user.external = scope.userData.external;
        scope.user.appSettings = scope.userData.appSettings;
        // For backward compatibility
        if (scope.user.appSettings['DEFAULT_VIS_GRAPH_SCHEMA'] === undefined) {
            scope.user.appSettings['DEFAULT_VIS_GRAPH_SCHEMA'] = true;
        }

        const pa = parseAuthorities(scope.userData.authorities);
        $scope.userType = pa.userType;
        $scope.grantedAuthorities = pa.grantedAuthorities;
        $scope.customRoles = pa.customRoles;
    };

    // =========================
    // Subscriptions
    // =========================

    $scope.$on('$destroy', function () {
        const workbenchSettings = WorkbenchSettingsStorageService.getWorkbenchSettings();
        ThemeService.toggleThemeMode(workbenchSettings.mode);
        $timeout.cancel(waitBeforeRedirectBack);
    });

    // =========================
    // Initialization
    // =========================

    const initView = () => {
        if (!$scope.workbenchSettings) {
            $scope.workbenchSettings = {
                theme: 'light'
            };
        }
        $scope.getPrincipal();
        $scope.setThemeMode();
        showCookiePolicyLink();
    };

    initView();
}
