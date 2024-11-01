import 'angular/core/services/similarity.service';
import 'angular/core/services/connectors.service';
import 'angular/core/services/ttyg.service';
import 'angular/rest/repositories.rest.service';
import {READ_REPO, WRITE_REPO} from "../services/constants";
import {UserType} from 'angular/utils/user-utils';
import {parseAuthorities} from "../services/authorities-util";

angular
    .module('graphdb.framework.security.controllers.user-settings', [])
    .controller('UserSettingsController', UserSettingsController);

UserSettingsController.$inject = [
    '$scope',
    'toastr',
    '$window',
    '$timeout',
    '$jwtAuth',
    '$rootScope',
    '$controller',
    'SecurityRestService',
    'ModalService',
    '$translate',
    'ThemeService',
    'WorkbenchSettingsStorageService',
    '$q',
    '$uibModal',
    '$licenseService'
];

function UserSettingsController($scope, toastr, $window, $timeout, $jwtAuth, $rootScope, $controller, SecurityRestService, ModalService, $translate, ThemeService, WorkbenchSettingsStorageService, $q, $uibModal, $licenseService) {
    angular.extend(this, $controller('CommonUserCtrl', {$scope: $scope, passwordPlaceholder: 'security.new.password'}));

    $scope.themes = ThemeService.getThemes();
    $scope.mode = 'settings';
    $scope.showWorkbenchSettings = true;
    /** @type {WorkbenchSettingsModel} */
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
    /** @type {ThemeModel} */
    $scope.selectedTheme = ThemeService.getTheme();

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

    // Wrapped in a scope function for ease of testing
    $scope.getPrincipal = function () {
        return $jwtAuth.getPrincipal()
            .then((principal) => {
                $scope.currentUserData = _.cloneDeep(principal);
            });
    };

    $scope.getPrincipal().then(() => {
        $scope.redirectAdmin();
        initUserData($scope);
    });

    $scope.updateCurrentUserData = function () {
        // Using $q.when to proper set values in view
        $q.when($jwtAuth.getPrincipal())
            .then((principal) => _.assign(principal, $scope.userData));
    };

    //call it as a function so I can make test on it
    $scope.redirectAdmin = function () {
        if (!$scope.currentUserData) {
            $rootScope.redirectToLogin();
        }
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
        SecurityRestService.updateUserData({
            username: $scope.user.username,
            pass: ($scope.noPassword) ? '' : $scope.user.password || undefined,
            appSettings: $scope.user.appSettings
        }).success(function () {
            $scope.updateCurrentUserData();
            toastr.success($translate.instant('security.user.updated', {name: $scope.user.username}));
            const timer = $timeout(function () {
                $scope.loader = false;
                $window.history.back();
            }, 2000);
            WorkbenchSettingsStorageService.saveWorkbenchSettings($scope.workbenchSettings);
            $scope.$on('$destroy', function () {
                $timeout.cancel(timer);
            });
        }).error(function (data) {
            const msg = getError(data);
            $scope.loader = false;
            toastr.error(msg, $translate.instant('common.error'));
        });
    };

    $scope.updateUser = function () {
        if (!$scope.validateForm()) {
            return false;
        }
        ThemeService.toggleThemeMode($scope.selectedThemeMode);
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

    const checkLicenseStatus = () => {
        $licenseService.checkLicenseStatus().then(() => {
            $scope.showCookiePolicyLink = $licenseService.isTrackingAllowed();
        }).catch((error) => {
            const msg = getError(error.data, error.status);
            toastr.error(msg, $translate.instant('common.error'));
        });
    };

    $scope.showCookiePolicy = () => {
        $uibModal.open({
            templateUrl: 'js/angular/core/templates/cookie-policy/cookie-policy.html',
            controller: ['$scope', function ($scope) {
                $scope.close = () => {
                    $scope.$close();
                };
            }],
            backdrop: 'static',
            windowClass: 'cookie-policy-modal',
            keyboard: false
        });
    };

    $scope.$on('$destroy', function () {
        const workbenchSettings = WorkbenchSettingsStorageService.getWorkbenchSettings();
        ThemeService.toggleThemeMode(workbenchSettings.mode);
    });

    const initView = () => {
        if (!$scope.workbenchSettings) {
            $scope.workbenchSettings = {
                theme: 'light'
            };
        }
        $scope.setThemeMode();
        checkLicenseStatus();
    };

    initView();
}
