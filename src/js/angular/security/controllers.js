import 'angular/core/services';
import 'angular/core/services/jwt-auth.service';
import 'angular/core/services/openid-auth.service';
import 'angular/core/services/security.service';
import {UserRole, UserType} from 'angular/utils/user-utils';
import 'angular/security/directives/custom-prefix-tags-input.directive';
import {
    GRAPHQL,
    GRAPHQL_PREFIX,
    READ_REPO,
    READ_REPO_PREFIX,
    SYSTEM_REPO,
    WRITE_REPO,
    WRITE_REPO_PREFIX
} from "./services/constants";
import {createUniqueKey, parseAuthorities} from "./services/authorities-util";

const modules = [
    'ngCookies',
    'ui.bootstrap',
    'graphdb.framework.core.services.jwtauth',
    'graphdb.framework.core.services.openIDService',
    'graphdb.framework.core.services.security-service',
    'toastr',
    'ngTagsInput'
];

const securityModule = angular.module('graphdb.framework.security.controllers', modules);

securityModule.controller('LoginCtrl', ['$scope', '$http', 'toastr', '$jwtAuth', '$openIDAuth', '$location', '$rootScope', '$translate', 'TrackingService', 'SecurityService',
    function ($scope, $http, toastr, $jwtAuth, $openIDAuth, $location, $rootScope, $translate, TrackingService, SecurityService) {
        $scope.username = '';
        $scope.password = '';

        // Reinitialize security settings, if failed for some reason
        $jwtAuth.reinitializeSecurity();

        TrackingService.applyTrackingConsent()
            .catch((error) => {
                const msg = getError(error.data, error.status);
                toastr.error(msg, $translate.instant('common.error'));
            });

        $scope.loginWithOpenID = function () {
            $jwtAuth.loginOpenID();
        };

        if ($location.search().noaccess) {
            toastr.error($translate.instant('security.no.rights.config.error'), $translate.instant('security.login.error'));
        } else if ($location.search().expired) {
            toastr.error($translate.instant('security.auth.token.expired'), $translate.instant('security.login.error'));
        }

        $scope.isGDBLoginEnabled = function () {
            return $jwtAuth.passwordLoginEnabled;
        };

        $scope.isOpenIDEnabled = function () {
            return $jwtAuth.openIDEnabled;
        };

        $scope.login = function () {
            return SecurityService.login($scope.username, $scope.password)
                .then(function ({data, status, headers}) {
                $jwtAuth.authenticate(data, headers('Authorization'))
                    .then(() => {
                        if ($rootScope.returnToUrl) {
                            // go back to remembered url
                            $location.url($rootScope.returnToUrl);
                        } else {
                            // don't have a remembered url, go home
                            $location.path('/');
                        }
                    });
            }).catch(function ({data, status}) {
                if (status === 401) {
                    toastr.error($translate.instant('security.wrong.credentials'), $translate.instant('common.error'));
                    $scope.wrongCredentials = true;
                    $scope.username = '';
                    $scope.password = '';
                } else {
                    const msg = getError(data);
                    toastr.error(msg, status);
                }
            });
        };
    }]);

securityModule.controller('UsersCtrl', ['$scope', '$uibModal', 'toastr', '$window', '$jwtAuth', '$timeout', 'ModalService', 'SecurityService', '$translate',
    function ($scope, $uibModal, toastr, $window, $jwtAuth, $timeout, ModalService, SecurityService, $translate) {

        $scope.loader = true;
        $scope.securityEnabled = function () {
            return $jwtAuth.isSecurityEnabled();
        };
        $scope.hasExternalAuth = function () {
            return $jwtAuth.hasExternalAuth();
        };
        $scope.getAuthImplementation = function () {
            return $jwtAuth.getAuthImplementation();
        };
        $scope.freeAccessEnabled = function () {
            return $jwtAuth.isFreeAccessEnabled();
        };
        $scope.getUsers = () => {
            return SecurityService.getUsers()
                .then(function (data) {
                    $scope.users = data;
                    for (let i = 0; i < $scope.users.length; i++) {
                        const pa = parseAuthorities($scope.users[i].grantedAuthoritiesUiModel);
                        $scope.users[i].userType = pa.userType;
                        $scope.users[i].userTypeDescription = pa.userTypeDescription;
                        $scope.users[i].repositories = pa.repositories;
                        $scope.users[i].customRoles = pa.customRoles;
                    }
                    $scope.loader = false;
                }).catch(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
                $scope.loader = false;
            });
        };
        $scope.getUsers();

        $scope.$on('repositoryIsSet', function () {
            $scope.getUsers();
        });

        $scope.toggleSecurity = function () {
            const isSecurityEnabled = $jwtAuth.isSecurityEnabled();
            $jwtAuth.toggleSecurity(!isSecurityEnabled)
                .then(() => {
                    // reload UI only if security status has changed
                    // TODO: Not sure if we really need to reload the page here. The UI state is updated just fine. But maybe the reload is needed for something else?
                    if (isSecurityEnabled !== $jwtAuth.isSecurityEnabled()) {
                        $window.location.reload();
                    }
                });
        };

        $scope.toggleFreeAccess = function (updateFreeAccess) {
            if (!$jwtAuth.isFreeAccessEnabled() || ($jwtAuth.isFreeAccessEnabled() && updateFreeAccess)) {
                SecurityService.getFreeAccess().then(function (res) {
                    const authorities = res.grantedAuthoritiesUiModel;
                    const appSettings = res.appSettings || {
                        'DEFAULT_SAMEAS': true,
                        'DEFAULT_INFERENCE': true,
                        'EXECUTE_COUNT': true,
                        'IGNORE_SHARED_QUERIES': false,
                        'DEFAULT_VIS_GRAPH_SCHEMA': true
                    };
                    configureFreeAccess(appSettings, authorities, updateFreeAccess);
                });
            } else {
                $jwtAuth.toggleFreeAccess(!$jwtAuth.isFreeAccessEnabled(), []);
            }
        };

        const configureFreeAccess = (appSettings, authorities, updateFreeAccess) => {
            const modalInstance = $uibModal.open({
                templateUrl: 'js/angular/security/templates/modal/default-authorities.html',
                controller: 'DefaultAuthoritiesCtrl',
                resolve: {
                    data: function () {
                        return {
                            // converts the array rights to hash ones. why, oh, why do we have both formats?
                            defaultAuthorities: function () {
                                const defaultAuthorities = {
                                    [READ_REPO]: {},
                                    [WRITE_REPO]: {},
                                    [GRAPHQL]: {}
                                };
                                // We might have old (no longer existing) repositories so we have to check that
                                const repoIds = _.mapKeys($scope.getRepositories(), function (r) {
                                    return createUniqueKey(r);
                                });
                                _.each(authorities, function (a) {
                                    // indexOf works in IE 11, startsWith doesn't
                                    if (a.indexOf(WRITE_REPO_PREFIX) === 0) {
                                        if (repoIds.hasOwnProperty(a.substr(11))) {
                                            defaultAuthorities[WRITE_REPO][a.substr(11)] = true;
                                        }
                                    } else if (a.indexOf(READ_REPO_PREFIX) === 0) {
                                        if (repoIds.hasOwnProperty(a.substr(10))) {
                                            defaultAuthorities[READ_REPO][a.substr(10)] = true;
                                        }
                                    } else if (a.indexOf(GRAPHQL_PREFIX) === 0) {
                                        if (repoIds.hasOwnProperty(a.substr(8))) {
                                            defaultAuthorities[GRAPHQL][a.substr(8)] = true;
                                        }
                                    }
                                });
                                return defaultAuthorities;
                            },
                            appSettings: appSettings
                        };
                    }
                }
            });
            modalInstance.result.then(function (data) {
                authorities = data.authorities;
                appSettings = data.appSettings;
                $jwtAuth.toggleFreeAccess(updateFreeAccess || !$jwtAuth.isFreeAccessEnabled(), authorities, appSettings, updateFreeAccess);
            });
        };

        $scope.editFreeAccess = function () {
            $scope.toggleFreeAccess(true);
        };

        $scope.removeUser = function (username) {
            ModalService.openSimpleModal({
                title: $translate.instant('common.confirm.delete'),
                message: $translate.instant('security.confirm.delete.user', {name: username}),
                warning: true
            }).result.then(function () {
                $scope.loader = true;
                SecurityService.deleteUser(username)
                    .then(() => $scope.getUsers())
                    .catch((data) => {
                        const msg = getError(data);
                        toastr.error(msg, $translate.instant('common.error'));
                        $scope.loader = false;
                    });
            });
        };

        // Should be able to send the original username to $routeParams
        $scope.encodeURIComponent = function (name) {
            return encodeURIComponent(name);
        };
    }]);

securityModule.controller('DefaultAuthoritiesCtrl', ['$scope', '$http', '$uibModalInstance', 'data', '$rootScope',
    function ($scope, $http, $uibModalInstance, data, $rootScope) {
        $scope.grantedAuthorities = data.defaultAuthorities();
        $scope.appSettings = data.appSettings;

        $scope.hasActiveLocation = function () {
            // Hack to get this from root scope to avoid cyclic dependency
            return !_.isEmpty($rootScope.globalLocation);
        };

        $scope.getRepositories = function () {
            // Hack to get this from root scope to avoid cyclic dependency
            return $rootScope.globalRepositories;
        };

        $scope.ok = function () {
            const auth = [];
            $scope.repositoryCheckError = true;
            for (const index in $scope.grantedAuthorities.WRITE_REPO) {
                if ($scope.grantedAuthorities.WRITE_REPO[index]) {
                    auth.push(WRITE_REPO_PREFIX + index);
                    auth.push(READ_REPO_PREFIX + index);
                    $scope.repositoryCheckError = false;
                }
            }
            for (const index in $scope.grantedAuthorities.READ_REPO) {
                if ($scope.grantedAuthorities.READ_REPO[index] && auth.indexOf(READ_REPO_PREFIX + index) === -1) {
                    auth.push(READ_REPO_PREFIX + index);
                    $scope.repositoryCheckError = false;
                }
            }
            for (const index in $scope.grantedAuthorities.GRAPHQL) {
                if ($scope.grantedAuthorities.GRAPHQL[index] && auth.indexOf(GRAPHQL_PREFIX + index) === -1) {
                    auth.push(GRAPHQL_PREFIX + index);
                }
            }
            if (!$scope.repositoryCheckError) {
                $uibModalInstance.close({authorities: auth, appSettings: $scope.appSettings});
            }
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.createUniqueKey = function (repository) {
            return createUniqueKey(repository);
        };
    }]);

securityModule.controller('CommonUserCtrl', ['$rootScope', '$scope', '$http', 'toastr', '$window', '$timeout', '$location', '$jwtAuth', '$translate', 'passwordPlaceholder',
    function ($rootScope, $scope, $http, toastr, $window, $timeout, $location, $jwtAuth, $translate, passwordPlaceholder) {
        $rootScope.$on('$translateChangeSuccess', function () {
            $scope.passwordPlaceholder = $translate.instant(passwordPlaceholder);
        });
        $scope.isAdmin = function () {
            return $jwtAuth.hasRole(UserRole.ROLE_ADMIN);
        };
        $scope.hasExternalAuth = function () {
            return $jwtAuth.hasExternalAuth();
        };

        $scope.hasEditRestrictions = function () {
            return $scope.user && $scope.user.username === UserType.ADMIN;
        };

        $scope.isOverrideAuth = function () {
            return $jwtAuth.isDefaultAuthEnabled();
        };

        $scope.setGrantedAuthorities = function () {
            function pushAuthority() {
                for (let i = 0; i < arguments.length; i++) {
                    const authority = arguments[i];
                    if (_.indexOf($scope.user.grantedAuthorities, authority) < 0) {
                        $scope.user.grantedAuthorities.push(authority);
                    }
                }
            }

            $scope.user.grantedAuthorities = [];

            $scope.repositoryCheckError = true;
            if ($scope.userType === UserType.ADMIN) {
                $scope.repositoryCheckError = false;
                pushAuthority(UserRole.ROLE_ADMIN);
            } else if ($scope.userType === UserType.REPO_MANAGER) {
                $scope.repositoryCheckError = false;
                pushAuthority(UserRole.ROLE_REPO_MANAGER);
            } else {
                pushAuthority(UserRole.ROLE_USER);
                for (const index in $scope.grantedAuthorities.WRITE_REPO) {
                    if ($scope.grantedAuthorities.WRITE_REPO[index]) {
                        $scope.repositoryCheckError = false;
                        pushAuthority(WRITE_REPO_PREFIX + index, READ_REPO_PREFIX + index);
                    }
                }
                for (const index in $scope.grantedAuthorities.READ_REPO) {
                    if ($scope.grantedAuthorities.READ_REPO[index]) {
                        $scope.repositoryCheckError = false;
                        pushAuthority(READ_REPO_PREFIX + index);
                    }
                }
                for (const index in $scope.grantedAuthorities.GRAPHQL) {
                    if ($scope.grantedAuthorities.GRAPHQL[index]) {
                        pushAuthority(GRAPHQL_PREFIX + index);
                    }
                }
            }
            if ($scope.customRoles) {
                $scope.customRoles.forEach((role) => pushAuthority('CUSTOM_' + role));
            }
        };

        $scope.$watch('userType', function () {
            if (!$scope.isUser()) {
                $scope.customRoles = "";
            }
        });

        $scope.isUser = function () {
            return $scope.userType === UserType.USER;
        };

        $scope.hasReadPermission = function (repository) {
            const uniqueKey = createUniqueKey(repository);
            return $scope.userType === UserType.ADMIN
                || $scope.userType === UserType.REPO_MANAGER
                || repository.id !== SYSTEM_REPO && ($scope.grantedAuthorities.READ_REPO['*']
                || $scope.grantedAuthorities.WRITE_REPO['*'])
                || $scope.grantedAuthorities.READ_REPO[uniqueKey]
                || $scope.grantedAuthorities.WRITE_REPO[uniqueKey];
        };

        $scope.hasWritePermission = function (repoOrWildCard) {
            const uniqueKey = createUniqueKey(repoOrWildCard);
            return $scope.userType === UserType.ADMIN
                || $scope.userType === UserType.REPO_MANAGER
                || repoOrWildCard.id !== SYSTEM_REPO && $scope.grantedAuthorities.WRITE_REPO['*']
                || $scope.grantedAuthorities.WRITE_REPO[uniqueKey];
        };

        $scope.hasGraphqlPermission = function (repository) {
            const uniqueKey = createUniqueKey(repository);
            return repository.id !== SYSTEM_REPO && $scope.grantedAuthorities.GRAPHQL['*']
                || $scope.grantedAuthorities.GRAPHQL[uniqueKey];
        };

        $scope.readCheckDisabled = function (repoOrWildCard) {
            return $scope.hasWritePermission(repoOrWildCard)
                || repoOrWildCard.id !== SYSTEM_REPO && repoOrWildCard !== '*' && $scope.grantedAuthorities.READ_REPO['*']
                || $scope.hasEditRestrictions();
        };

        $scope.writeCheckDisabled = function (repoOrWildCard) {
            return $scope.userType === UserType.ADMIN
                || $scope.userType === UserType.REPO_MANAGER
                || repoOrWildCard.id !== SYSTEM_REPO && repoOrWildCard !== '*' && $scope.grantedAuthorities.WRITE_REPO['*']
                || $scope.hasEditRestrictions();
        };

        /**
         * Determines whether the GraphQL checkbox for a given repository or wildcard
         * should be disabled.
         *
         * @param {Object|string} repoOrWildCard - A repo object or the string wildcard '*'
         * @returns {boolean} true if disabled, false if enabled
         */
        $scope.graphqlCheckDisabled = function (repoOrWildCard) {
            if ($scope.userType === UserType.ADMIN || $scope.userType === UserType.REPO_MANAGER) {
                return true;
            }

            if ($scope.hasEditRestrictions()) {
                return true;
            }

            if (repoOrWildCard !== '*' && $scope.grantedAuthorities.GRAPHQL['*']) {
                return true;
            }

            if (repoOrWildCard === '*' && $scope.grantedAuthorities.GRAPHQL['*']) {
                return false;
            }

            let uniqueKey;
            if (repoOrWildCard !== null && typeof repoOrWildCard === 'object') {
                uniqueKey = $scope.createUniqueKey(repoOrWildCard);
            } else {
                uniqueKey = repoOrWildCard;
            }

            const hasReadWildcard = $scope.grantedAuthorities.READ_REPO['*'];
            const hasWriteWildcard = $scope.grantedAuthorities.WRITE_REPO['*'];
            const hasReadForRepo   = $scope.grantedAuthorities.READ_REPO[uniqueKey];
            const hasWriteForRepo  = $scope.grantedAuthorities.WRITE_REPO[uniqueKey];

            return !(hasReadWildcard || hasWriteWildcard || hasReadForRepo || hasWriteForRepo);
        };


        $scope.createUniqueKey = function (repository) {
            return createUniqueKey(repository);
        };

        $scope.userType = UserType.USER;
        $scope.grantedAuthorities = {
            [READ_REPO]: {},
            [WRITE_REPO]: {},
            [GRAPHQL]: {}
        };

        $scope.validatePassword = function () {
            if ($scope.noPassword) {
                $scope.passwordError = '';
                $scope.confirmPasswordError = '';
                return true;
            }
            if ($scope.user.password !== $scope.user.confirmpassword) {
                if (!$scope.user.password) {
                    $scope.passwordError = $translate.instant('security.enter.password');
                    $scope.confirmPasswordError = '';
                } else {
                    $scope.passwordError = '';
                    $scope.confirmPasswordError = $translate.instant('security.confirm.password');
                }
                return false;
            } else {
                $scope.passwordError = '';
                $scope.confirmPasswordError = '';
            }
            return true;
        };

        $scope.isLocalAuthentication = function () {
            return $jwtAuth.getAuthImplementation() === 'Local';
        };

        $scope.updateUser = function () {
            if (!$scope.validateForm()) {
                return false;
            }

            if ($scope.isLocalAuthentication()) {
                $scope.setGrantedAuthorities();
            }

            if (!$scope.repositoryCheckError) {
                $scope.updateUserHttp();
            }
        };

        $scope.setNoPassword = function () {
            if ($scope.noPassword) {
                $scope.user.password = '';
                $scope.user.confirmpassword = '';
                $scope.passwordError = '';
                $scope.confirmPasswordError = '';
            }
        };

        $scope.shouldDisableSameAs = function () {
            const sameAsCheckbox = $('#sameAsCheck');
            if ($scope.user && !$scope.user.appSettings.DEFAULT_INFERENCE && sameAsCheckbox.prop('checked')) {
                sameAsCheckbox.prop("checked", false);
                $scope.user.appSettings.DEFAULT_SAMEAS = false;
            }

            return $scope.user && !$scope.user.appSettings.DEFAULT_INFERENCE;
        };

        /**
         * The validity of the last user typed custom role.
         * @type {boolean}
         */
        $scope.isRoleValid = true;
        const minTagLength = 2;

        /**
         * Adds the user typed custom role and sets role validity flag to true.
         *
         * @param {{text: string}} role the user input
         * @return {{text: string}} the user input in uppercase
         */
        $scope.addCustomRole = function (role) {
            $scope.isRoleValid = true;
            role.text = role.text.toUpperCase();
            return role;
        };

        /**
         * Checks if the input text is valid or not.
         *
         * @param {{text: string}} fieldValue the user input
         * @return {boolean} true if valid, otherwise false
         */
        $scope.isCustomRoleValid = function (fieldValue) {
            $scope.isRoleValid = fieldValue.text.length >= minTagLength;
            return $scope.isRoleValid;
        };

        /**
         * Checks if the user pressed the 'Backspace' or 'Delete' key and sets the role validity flag accordingly.
         *
         * @param {Object} event
         */
        $scope.checkUserInput = function (event) {
            // If the key pressed is the backspace or delete key, the tag error message will be hidden
            if (event.keyCode === 8 || event.keyCode === 46) {
                $scope.isRoleValid = true;
            }
        };

        /**
         * Sets the role validity flag to true.
         */
        $scope.removeErrorOnCut = function () {
            // If the user cuts text from the field, the tag error message will be hidden
            $scope.isRoleValid = true;
        };
    }]);

securityModule.controller('AddUserCtrl', ['$scope', '$http', 'toastr', '$window', '$timeout', '$location', '$jwtAuth', '$controller', 'SecurityService', 'ModalService', '$translate',
    function ($scope, $http, toastr, $window, $timeout, $location, $jwtAuth, $controller, SecurityService, ModalService, $translate) {

        angular.extend(this, $controller('CommonUserCtrl', {$scope: $scope, passwordPlaceholder: 'security.password.placeholder'}));

        $scope.mode = 'add';
        $scope.saveButtonText = $translate.instant('common.create.btn');
        $scope.goBack = function () {
            const timer = $timeout(function () {
                $window.history.back();
            }, 100);
            $scope.$on('$destroy', function () {
                $timeout.cancel(timer);
            });
        };
        $scope.pageTitle = $translate.instant('view.create.user.title');
        $scope.passwordPlaceholder = $translate.instant('security.password.placeholder');

        $scope.user = {
            'username': '',
            'password': '',
            'confirmpassword': '',
            'grantedAuthorities': [],
            'appSettings': {
                'DEFAULT_SAMEAS': true,
                'DEFAULT_INFERENCE': true,
                'EXECUTE_COUNT': true,
                'IGNORE_SHARED_QUERIES': false,
                'DEFAULT_VIS_GRAPH_SCHEMA': true
            }
        };

        $scope.submit = function () {
            if ($scope.noPassword && $scope.userType === UserType.ADMIN) {
                ModalService.openSimpleModal({
                    title: $translate.instant('security.create.admin'),
                    message: $translate.instant('security.admin.login.warning'),
                    warning: true
                }).result.then(function () {
                    $scope.createUser();
                });
            } else {
                $scope.createUser();
            }
        };

        $scope.createUserHttp = function () {
            $scope.loader = true;
            SecurityService.createUser({
                username: $scope.user.username,
                pass: $scope.user.password,
                appSettings: $scope.user.appSettings,
                grantedAuthorities: $scope.user.grantedAuthorities
            }).then(() => {
                toastr.success($translate.instant('security.user.created', {name: $scope.user.username}));
                const timer = $timeout(function () {
                    $scope.loader = false;
                    $window.history.back();
                }, 2000);
                $scope.$on('$destroy', function () {
                    $timeout.cancel(timer);
                });
            }).catch((data) => {
                const msg = getError(data);
                $scope.loader = false;
                toastr.error(msg, $translate.instant('common.error'));
            });
        };

        $scope.createUser = function () {
            if ($scope.validateForm()) {
                $scope.setGrantedAuthorities();

                if (!$scope.repositoryCheckError) {
                    $scope.createUserHttp();
                }
            }
        };

        $scope.validateForm = function () {
            let result = true;
            if (!$scope.user.username) {
                $scope.usernameError = $translate.instant('security.enter.username');
                result = false;
            } else {
                $scope.usernameError = '';
            }
            if ($scope.noPassword) {
                $scope.passwordError = '';
                $scope.confirmPasswordError = '';
            } else {
                if (!$scope.user.password) {
                    $scope.passwordError = $translate.instant('security.enter.password');
                    result = false;
                } else {
                    $scope.passwordError = '';
                }
                if (!$scope.user.confirmpassword || $scope.user.password !== $scope.user.confirmpassword) {
                    $scope.confirmPasswordError = $translate.instant('security.confirm.password');
                    result = false;
                } else {
                    $scope.confirmPasswordError = '';
                }
            }

            return result;
        };
    }]);

securityModule.controller('EditUserCtrl', ['$scope', '$http', 'toastr', '$window', '$routeParams', '$timeout', '$location', '$jwtAuth', '$controller', 'SecurityService', 'ModalService', '$translate',
    function ($scope, $http, toastr, $window, $routeParams, $timeout, $location, $jwtAuth, $controller, SecurityService, ModalService, $translate) {

        angular.extend(this, $controller('CommonUserCtrl', {$scope: $scope, passwordPlaceholder: 'security.new.password'}));

        $scope.mode = 'edit';
        $scope.saveButtonText = $translate.instant('common.save.btn');
        $scope.goBack = function () {
            const timer = $timeout(function () {
                $window.history.back();
            }, 100);
            $scope.$on('$destroy', function () {
                $timeout.cancel(timer);
            });
        };
        $scope.params = $routeParams;
        $scope.pageTitle = $translate.instant('view.edit.user.title', {userId: $scope.params.userId});
        $scope.passwordPlaceholder = $translate.instant('security.new.password');
        $scope.userType = UserType.USER;
        const defaultUserSettings = {
            'DEFAULT_SAMEAS': true,
            'DEFAULT_INFERENCE': true,
            'EXECUTE_COUNT': true,
            'IGNORE_SHARED_QUERIES': false,
            'DEFAULT_VIS_GRAPH_SCHEMA': true
        };

        if (!$jwtAuth.hasRole(UserRole.ROLE_ADMIN)) {
            $location.url('settings');
        }
        $scope.getUserData = function () {
            SecurityService.getUser($scope.params.userId).then(function (data) {
                $scope.userData = data;
                $scope.user = {username: $scope.userData.username};
                $scope.user.password = '';
                $scope.user.confirmpassword = '';
                $scope.user.external = $scope.userData.external;
                $scope.user.appSettings = data.appSettings || defaultUserSettings;
                $scope.userType = UserType.USER;
                const pa = parseAuthorities(data.grantedAuthoritiesUiModel);
                $scope.userType = pa.userType;
                $scope.grantedAuthorities = pa.grantedAuthorities;
                $scope.customRoles = pa.customRoles;
            }).catch(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
            });
        };

        $scope.getUserData();

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
            SecurityService.updateUser({
                username: $scope.user.username,
                pass: ($scope.noPassword) ? '' : $scope.user.password || undefined,
                appSettings: $scope.user.appSettings,
                grantedAuthorities: $scope.user.grantedAuthorities
            }).then(() => {
                toastr.success($translate.instant('security.user.updated', {name: $scope.user.username}));
                const timer = $timeout(function () {
                    $scope.loader = false;
                    $window.history.back();
                }, 2000);
                $scope.$on('$destroy', function () {
                    $timeout.cancel(timer);
                });
                // if we update the settings of the currently logged user, update the principal
                $jwtAuth.getPrincipal().then((principal) => {
                    if ($scope.user.username === principal.username) {
                        principal.appSettings = $scope.user.appSettings;
                    }
                });
            }).catch((data) => {
                const msg = getError(data);
                $scope.loader = false;
                toastr.error(msg, $translate.instant('common.error'));
            });
        };

        $scope.validateForm = function () {
            return $scope.validatePassword();
        };
    }]);

securityModule.controller('RolesMappingController', ['$scope', 'toastr', 'SecurityService', '$translate',
    function ($scope, toastr, SecurityService, $translate) {

        $scope.debugMapping = function (role, mapping) {
            const method = mapping.split(':');
            SecurityService.getRolesMapping({
                role: role,
                method: method[1],
                mapping: method[0]
            });
        };

        const loadRoles = function () {
            SecurityService.getRoles()
                .success(function (data) {
                    $scope.roleMappings = data;
                    $scope.roles = _.keys($scope.roleMappings);
                    $scope.mappings = _.keys($scope.roleMappings[$scope.roles[0]]);
                    const permissionsCount = _.map($scope.roles, function (role) {
                        return [role, _.filter($scope.roleMappings[role]).length];
                    });
                    $scope.roles = _.reverse(_.map(_.orderBy(permissionsCount, function (p) {
                        return p[1];
                    }), function (p) {
                        return p[0];
                    }));
                })
                .error(function (data) {
                    const msg = getError(data);
                    $scope.loader = false;
                    toastr.error(msg, $translate.instant('common.error'));
                });
        };

        $scope.$on('repositoryIsSet', function () {
            loadRoles();
        });
    }]);

securityModule.controller('DeleteUserCtrl', ['$scope', '$uibModalInstance', 'username', function ($scope, $uibModalInstance, username) {
    $scope.username = username;

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);
