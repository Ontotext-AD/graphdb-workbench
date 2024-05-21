import 'angular/core/services';
import 'angular/core/services/jwt-auth.service';
import 'angular/core/services/openid-auth.service';
import 'angular/rest/security.rest.service';
import {UserUtils, UserRole, UserType} from 'angular/utils/user-utils';

const SYSTEM_REPO = 'SYSTEM';
const READ_REPO = 'READ_REPO';
const READ_REPO_PREFIX = 'READ_REPO_';
const WRITE_REPO = 'WRITE_REPO';
const WRITE_REPO_PREFIX = 'WRITE_REPO_';

const modules = [
    'ngCookies',
    'ui.bootstrap',
    'graphdb.framework.core.services.jwtauth',
    'graphdb.framework.core.services.openIDService',
    'graphdb.framework.rest.security.service',
    'toastr',
    'ngTagsInput'
];

const createUniqueKey = function (repository) {
    if (repository.location) {
        return `${repository.id}@${repository.location}`;
    }
    return repository.id;
};

const securityCtrl = angular.module('graphdb.framework.security.controllers', modules);

const setGrantedAuthorities = function ($scope) {
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
    }
    if ($scope.customRoles) {
        $scope.customRoles.forEach((role) => pushAuthority('CUSTOM_' + role));
    }
};

const parseAuthorities = function (authorities) {
    let userType = UserType.USER;
    const grantedAuthorities = {
        [READ_REPO]: {},
        [WRITE_REPO]: {}
    };
    const repositories = {};
    const customRoles = [];
    for (let i = 0; i < authorities.length; i++) {
        const role = authorities[i];
        if (role === UserRole.ROLE_ADMIN) {
            userType = UserType.ADMIN;
        } else if (role === UserRole.ROLE_REPO_MANAGER) {
            if (userType !== UserType.ADMIN) {
                userType = UserType.REPO_MANAGER;
            }
        } else if (role === UserRole.ROLE_USER) {
            userType = UserType.USER;
        } else if (role.indexOf('READ_REPO_') === 0 || role.indexOf('WRITE_REPO_') === 0) {
            const index = role.indexOf('_', role.indexOf('_') + 1);
            const op = role.substr(0, index);
            const repo = role.substr(index + 1);
            grantedAuthorities[op][repo] = true;
            repositories[repo] = repositories[repo] || {};
            if (op === READ_REPO) {
                repositories[repo].read = true;
            } else if (op === WRITE_REPO) {
                repositories[repo].write = true;
            }
        } else if (role.indexOf('CUSTOM_') === 0) {
            customRoles.push(role.substr('CUSTOM_'.length));
        }
    }

    return {
        userType: userType,
        userTypeDescription: UserUtils.getUserRoleName(userType),
        grantedAuthorities: grantedAuthorities,
        repositories: repositories,
        customRoles: customRoles
    };
};

securityCtrl.controller('LoginCtrl', ['$scope', '$http', 'toastr', '$jwtAuth', '$openIDAuth', '$location', '$rootScope', '$translate',
    function ($scope, $http, toastr, $jwtAuth, $openIDAuth, $location, $rootScope, $translate) {
        $scope.username = '';
        $scope.password = '';

        // Reinitialize security settings, if failed for some reason
        $jwtAuth.reinitializeSecurity();

        $scope.loginWithOpenID = function() {
            $jwtAuth.loginOpenID();
        };

        if ($location.search().noaccess) {
            toastr.error($translate.instant('security.no.rights.config.error'), $translate.instant('security.login.error'));
        } else if ($location.search().expired) {
            toastr.error($translate.instant('security.auth.token.expired'), $translate.instant('security.login.error'));
        }

        $scope.isGDBLoginEnabled = function() {
            return $jwtAuth.passwordLoginEnabled;
        };

        $scope.isOpenIDEnabled = function() {
            return $jwtAuth.openIDEnabled;
        };

        $scope.login = function () {
            return $http({
                method: 'POST',
                url: 'rest/login',
                data: {
                    'username': $scope.username,
                    'password': $scope.password
                }
            }).success(function (data, status, headers) {
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
            }).error(function (data, status) {
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

securityCtrl.controller('UsersCtrl', ['$scope', '$uibModal', 'toastr', '$window', '$jwtAuth', '$timeout', 'ModalService', 'SecurityRestService', '$translate',
    function ($scope, $uibModal, toastr, $window, $jwtAuth, $timeout, ModalService, SecurityRestService, $translate) {

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
        $scope.getUsers = function () {
            SecurityRestService.getUsers()
                .success(function (data) {
                    $scope.users = data;
                    for (let i = 0; i < $scope.users.length; i++) {
                        const pa = parseAuthorities($scope.users[i].grantedAuthorities);
                        $scope.users[i].userType = pa.userType;
                        $scope.users[i].userTypeDescription = pa.userTypeDescription;
                        $scope.users[i].repositories = pa.repositories;
                        $scope.users[i].customRoles = pa.customRoles;
                    }
                    $scope.loader = false;
                }).error(function (data) {
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
            $jwtAuth.toggleSecurity(!$jwtAuth.isSecurityEnabled());
            if ($jwtAuth.isSecurityEnabled()) {
                const timer = $timeout(function () {
                    $window.location.reload();
                }, 500);
                $scope.$on('$destroy', function () {
                    $timeout.cancel(timer);
                });
            }
        };

        $scope.toggleFreeAccess = function (updateFreeAccess) {
            if (!$jwtAuth.isFreeAccessEnabled() || ($jwtAuth.isFreeAccessEnabled() && updateFreeAccess)) {
                SecurityRestService.getFreeAccess().then(function (res) {
                    let authorities = res.data.authorities;
                    let appSettings = res.data.appSettings || {
                        'DEFAULT_SAMEAS': true,
                        'DEFAULT_INFERENCE': true,
                        'EXECUTE_COUNT': true,
                        'IGNORE_SHARED_QUERIES': false,
                        'DEFAULT_VIS_GRAPH_SCHEMA': true
                    };
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
                                            [WRITE_REPO]: {}
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
                });
            } else {
                $jwtAuth.toggleFreeAccess(!$jwtAuth.isFreeAccessEnabled(), []);
            }
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
                SecurityRestService.deleteUser(username).success(function () {
                    $scope.getUsers();
                }).error(function (data) {
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

securityCtrl.controller('DefaultAuthoritiesCtrl', ['$scope', '$http', '$uibModalInstance', 'data', '$rootScope',
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

securityCtrl.controller('CommonUserCtrl', ['$rootScope', '$scope', '$http', 'toastr', '$window', '$timeout', '$location', '$jwtAuth', '$translate', 'passwordPlaceholder',
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
            setGrantedAuthorities($scope);
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
            return $scope.userType === UserType.ADMIN || $scope.userType === UserType.REPO_MANAGER
                || repository.id !== SYSTEM_REPO
                && ($scope.grantedAuthorities.READ_REPO['*'] || $scope.grantedAuthorities.WRITE_REPO['*'])
                || $scope.grantedAuthorities.READ_REPO[uniqueKey]
                || $scope.grantedAuthorities.WRITE_REPO[uniqueKey];
        };

        $scope.hasWritePermission = function (repoOrWildCard) {
            const uniqueKey = createUniqueKey(repoOrWildCard);
            return $scope.userType === UserType.ADMIN || $scope.userType === UserType.REPO_MANAGER
                || repoOrWildCard.id !== SYSTEM_REPO && $scope.grantedAuthorities.WRITE_REPO['*']
                || $scope.grantedAuthorities.WRITE_REPO[uniqueKey];
        };

        $scope.readCheckDisabled = function (repoOrWildCard) {
            return $scope.hasWritePermission(repoOrWildCard)
                || repoOrWildCard.id !== SYSTEM_REPO && repoOrWildCard !== '*' && $scope.grantedAuthorities.READ_REPO['*']
                || $scope.hasEditRestrictions();
        };

        $scope.writeCheckDisabled = function (repoOrWildCard) {
            return $scope.userType === UserType.ADMIN || $scope.userType === UserType.REPO_MANAGER
                || repoOrWildCard.id !== SYSTEM_REPO && repoOrWildCard !== '*' && $scope.grantedAuthorities.WRITE_REPO['*']
                || $scope.hasEditRestrictions();
        };

        $scope.createUniqueKey = function (repository) {
            return createUniqueKey(repository);
        };

        $scope.userType = UserType.USER;
        $scope.grantedAuthorities = {
            [READ_REPO]: {},
            [WRITE_REPO]: {}
        };

        $scope.validatePassword = function() {
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

        $scope.isLocalAuthentication = function() {
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

        $scope.setNoPassword = function() {
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

        $scope.showTagError = false;

        $scope.addCustomRole = function (role) {
            $scope.showTagError = false;
            role.text = role.text.toUpperCase();
            return role;
        };

        $scope.validateTag = function (tag) {
            if (tag.text.length < 2 ) {
                $scope.showTagError = true;
                return false;
            }
            $scope.showTagError = false;
            return true;
        };

        $scope.checkForBackspace = function(event) {
            // If the key pressed is the backspace or delete key, the tag error message will be hidden
            if (event.keyCode === 8 || event.keyCode === 46) {
                $scope.showTagError = false;
            }
        };
    }]);

securityCtrl.controller('AddUserCtrl', ['$scope', '$http', 'toastr', '$window', '$timeout', '$location', '$jwtAuth', '$controller', 'SecurityRestService', 'ModalService', '$translate',
    function ($scope, $http, toastr, $window, $timeout, $location, $jwtAuth, $controller, SecurityRestService, ModalService, $translate) {

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
            SecurityRestService.createUser({
                username: $scope.user.username,
                pass: $scope.user.password,
                appSettings: $scope.user.appSettings,
                grantedAuthorities: $scope.user.grantedAuthorities
            }).success(function () {
                toastr.success($translate.instant('security.user.created', {name: $scope.user.username}));
                const timer = $timeout(function () {
                    $scope.loader = false;
                    $window.history.back();
                }, 2000);
                $scope.$on('$destroy', function () {
                    $timeout.cancel(timer);
                });
            }).error(function (data) {
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

securityCtrl.controller('EditUserCtrl', ['$scope', '$http', 'toastr', '$window', '$routeParams', '$timeout', '$location', '$jwtAuth', '$controller', 'SecurityRestService', 'ModalService', '$translate',
    function ($scope, $http, toastr, $window, $routeParams, $timeout, $location, $jwtAuth, $controller, SecurityRestService, ModalService, $translate) {

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
            SecurityRestService.getUser($scope.params.userId).success(function (data) {
                $scope.userData = data;
                $scope.user = {username: $scope.userData.username};
                $scope.user.password = '';
                $scope.user.confirmpassword = '';
                $scope.user.external = $scope.userData.external;
                $scope.user.appSettings = data.appSettings || defaultUserSettings;
                $scope.userType = UserType.USER;
                const pa = parseAuthorities(data.grantedAuthorities);
                $scope.userType = pa.userType;
                $scope.grantedAuthorities = pa.grantedAuthorities;
                $scope.customRoles = pa.customRoles;
            }).error(function (data) {
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
            SecurityRestService.updateUser({
                username: $scope.user.username,
                pass: ($scope.noPassword) ? '' : $scope.user.password || undefined,
                appSettings: $scope.user.appSettings,
                grantedAuthorities: $scope.user.grantedAuthorities
            }).success(function () {
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
            }).error(function (data) {
                const msg = getError(data);
                $scope.loader = false;
                toastr.error(msg, $translate.instant('common.error'));
            });
        };

        $scope.validateForm = function () {
            return $scope.validatePassword();
        };
    }]);

securityCtrl.controller('RolesMappingController', ['$scope', 'toastr', 'SecurityRestService', '$translate',
    function ($scope, toastr, SecurityRestService, $translate) {

    $scope.debugMapping = function (role, mapping) {
        const method = mapping.split(':');
        SecurityRestService.getRolesMapping({
            role: role,
            method: method[1],
            mapping: method[0]
        });
    };

    const loadRoles = function () {
        SecurityRestService.getRoles()
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

securityCtrl.controller('ChangeUserPasswordSettingsCtrl', ['$scope', 'toastr', '$window', '$timeout', '$jwtAuth', '$rootScope', '$controller', 'SecurityRestService', 'ModalService', '$translate', 'ThemeService', 'WorkbenchSettingsStorageService', '$q',
    function ($scope, toastr, $window, $timeout, $jwtAuth, $rootScope, $controller, SecurityRestService, ModalService, $translate, ThemeService, WorkbenchSettingsStorageService, $q) {

        angular.extend(this, $controller('CommonUserCtrl', {$scope: $scope, passwordPlaceholder: 'security.new.password'}));

        $scope.themes = ThemeService.getThemes();
        $scope.mode = 'settings';
        $scope.showWorkbenchSettings = true;
        /** @type {WorkbenchSettingsModel} */
        $scope.workbenchSettings = WorkbenchSettingsStorageService.getWorkbenchSettings();
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

            $scope.updateUserHttp();
        };

        $scope.validateForm = function () {
            return $scope.validatePassword();
        };

        $scope.setThemeMode = function () {
            ThemeService.toggleThemeMode($scope.workbenchSettings.mode);
        };

        /**
         * @param {{name: string, label: string}} theme
         */
        $scope.setTheme = (theme) => {
            $scope.selectedTheme = theme;
            $scope.workbenchSettings.theme = theme.name;
            ThemeService.applyTheme(theme.name);
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
        };

        initView();
    }]);

securityCtrl.controller('DeleteUserCtrl', ['$scope', '$uibModalInstance', 'username', function ($scope, $uibModalInstance, username) {
    $scope.username = username;

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);
