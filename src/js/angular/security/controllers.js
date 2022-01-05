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
    'toastr'
];

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
};

const parseAuthorities = function (authorities) {
    let userType = UserType.USER;
    const grantedAuthorities = {
        [READ_REPO]: {},
        [WRITE_REPO]: {}
    };
    const repositories = {};
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
        } else if (role.indexOf('ROLE_') !== 0) {
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
        }
    }

    return {
        userType: userType,
        userTypeDescription: UserUtils.getUserRoleName(userType),
        grantedAuthorities: grantedAuthorities,
        repositories: repositories
    };
};

securityCtrl.controller('LoginCtrl', ['$scope', '$http', 'toastr', '$jwtAuth', '$openIDAuth', '$timeout', '$location', '$rootScope',
    function ($scope, $http, toastr, $jwtAuth, $openIDAuth, $timeout, $location, $rootScope) {
        $scope.username = '';
        $scope.password = '';

        $scope.loginWithOpenID = function() {
            $jwtAuth.loginOpenID();
        };

        if ($location.search().noaccess) {
            toastr.error('User has no access rights or configuration error.', 'Login error');
        } else if ($location.search().expired) {
            toastr.error('Your authentication token has expired. Please login again.', 'Login error');
        }

        $scope.isGDBLoginEnabled = function() {
            return $jwtAuth.passwordLoginEnabled;
        };

        $scope.isOpenIDEnabled = function() {
            return $jwtAuth.openIDEnabled;
        };

        $scope.login = function () {
            $http({
                method: 'POST',
                url: 'rest/login/' + encodeURIComponent($scope.username),
                headers: {
                    'X-GraphDB-Password': $scope.password
                }
            }).success(function (data, status, headers) {
                $jwtAuth.authenticate(data, headers('Authorization'));
                const timer = $timeout(function () {
                    if ($rootScope.returnToUrl) {
                        // go back to remembered url
                        $location.url($rootScope.returnToUrl);
                    } else {
                        // no remembered url, go to home
                        $location.path('/');
                    }
                }, 500);
                $scope.$on('$destroy', function () {
                    $timeout.cancel(timer);
                });
            }).error(function (data, status) {
                if (status === 401) {
                    toastr.error('Wrong credentials!', 'Error');
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

securityCtrl.controller('UsersCtrl', ['$scope', '$modal', 'toastr', '$window', '$jwtAuth', '$timeout', 'ModalService', 'SecurityRestService',
    function ($scope, $modal, toastr, $window, $jwtAuth, $timeout, ModalService, SecurityRestService) {

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
                    }
                    $scope.loader = false;
                }).error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, 'Error');
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
                    const modalInstance = $modal.open({
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
                                            return r.id;
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
                title: 'Confirm delete',
                message: 'Are you sure you want to delete the user \'' + username + '\'?',
                warning: true
            }).result.then(function () {
                $scope.loader = true;
                SecurityRestService.deleteUser(username).success(function () {
                    $scope.getUsers();
                }).error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, 'Error');

                    $scope.loader = false;
                });

            });
        };

        // Should be able to send the original username to $routeParams
        $scope.encodeURIComponent = function (name) {
            return encodeURIComponent(name);
        };
    }]);

securityCtrl.controller('DefaultAuthoritiesCtrl', ['$scope', '$http', '$modalInstance', 'data', '$rootScope',
    function ($scope, $http, $modalInstance, data, $rootScope) {
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
                $modalInstance.close({authorities: auth, appSettings: $scope.appSettings});
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

securityCtrl.controller('CommonUserCtrl', ['$scope', '$http', 'toastr', '$window', '$timeout', '$location', '$jwtAuth',
    function ($scope, $http, toastr, $window, $timeout, $location, $jwtAuth) {

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

        $scope.hasReadPermission = function (repositoryId) {
            return $scope.userType === UserType.ADMIN || $scope.userType === UserType.REPO_MANAGER
                || $scope.grantedAuthorities.READ_REPO[repositoryId]
                || $scope.grantedAuthorities.WRITE_REPO[repositoryId]
                || repositoryId !== SYSTEM_REPO
                && ($scope.grantedAuthorities.READ_REPO['*'] || $scope.grantedAuthorities.WRITE_REPO['*']);
        };

        $scope.hasWritePermission = function (repositoryId) {
            return $scope.userType === UserType.ADMIN || $scope.userType === UserType.REPO_MANAGER
                || $scope.grantedAuthorities.WRITE_REPO[repositoryId]
                || repositoryId !== SYSTEM_REPO && $scope.grantedAuthorities.WRITE_REPO['*'];
        };

        $scope.readCheckDisabled = function (repositoryId) {
            return $scope.hasWritePermission(repositoryId)
                || repositoryId !== SYSTEM_REPO && repositoryId !== '*' && $scope.grantedAuthorities.READ_REPO['*']
                || $scope.hasEditRestrictions();
        };

        $scope.writeCheckDisabled = function (repositoryId) {
            return $scope.userType === UserType.ADMIN || $scope.userType === UserType.REPO_MANAGER
                || repositoryId !== SYSTEM_REPO && repositoryId !== '*' && $scope.grantedAuthorities.WRITE_REPO['*']
                || $scope.hasEditRestrictions();
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
                    $scope.passwordError = 'Enter password!';
                    $scope.confirmPasswordError = '';
                } else {
                    $scope.passwordError = '';
                    $scope.confirmPasswordError = 'Confirm password!';
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
        }
    }]);

securityCtrl.controller('AddUserCtrl', ['$scope', '$http', 'toastr', '$window', '$timeout', '$location', '$jwtAuth', '$controller', 'SecurityRestService',
    function ($scope, $http, toastr, $window, $timeout, $location, $jwtAuth, $controller, SecurityRestService) {

        angular.extend(this, $controller('CommonUserCtrl', {$scope: $scope}));

        $scope.mode = 'add';
        $scope.saveButtonText = 'Create';
        $scope.goBack = function () {
            const timer = $timeout(function () {
                $window.history.back();
            }, 100);
            $scope.$on('$destroy', function () {
                $timeout.cancel(timer);
            });
        };
        $scope.pageTitle = 'Create new user';
        $scope.passwordPlaceholder = 'Password';

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
            $scope.createUser();
        };

        $scope.createUserHttp = function () {
            $scope.loader = true;
            SecurityRestService.createUser({
                username: $scope.user.username,
                pass: $scope.user.password,
                appSettings: $scope.user.appSettings,
                grantedAuthorities: $scope.user.grantedAuthorities
            }).success(function () {
                toastr.success('The user ' + $scope.user.username + ' has been created.');
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
                toastr.error(msg, 'Error');
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
                $scope.usernameError = 'Enter username!';
                result = false;
            } else {
                $scope.usernameError = '';
            }
            if ($scope.noPassword) {
                $scope.passwordError = '';
                $scope.confirmPasswordError = '';
            } else {
                if (!$scope.user.password) {
                    $scope.passwordError = 'Enter password!';
                    result = false;
                } else {
                    $scope.passwordError = '';
                }
                if (!$scope.user.confirmpassword || $scope.user.password !== $scope.user.confirmpassword) {
                    $scope.confirmPasswordError = 'Confirm password!';
                    result = false;
                } else {
                    $scope.confirmPasswordError = '';
                }
            }

            return result;
        };
    }]);

securityCtrl.controller('EditUserCtrl', ['$scope', '$http', 'toastr', '$window', '$routeParams', '$timeout', '$location', '$jwtAuth', '$controller', 'SecurityRestService',
    function ($scope, $http, toastr, $window, $routeParams, $timeout, $location, $jwtAuth, $controller, SecurityRestService) {

        angular.extend(this, $controller('CommonUserCtrl', {$scope: $scope}));

        $scope.mode = 'edit';
        $scope.saveButtonText = 'Save';
        $scope.goBack = function () {
            const timer = $timeout(function () {
                $window.history.back();
            }, 100);
            $scope.$on('$destroy', function () {
                $timeout.cancel(timer);
            });
        };
        $scope.params = $routeParams;
        $scope.pageTitle = 'Edit user: ' + $scope.params.userId;
        $scope.passwordPlaceholder = 'New password';
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
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error');
            });
        };

        $scope.getUserData();

        $scope.submit = function () {
            $scope.updateUser();
        };

        $scope.updateUserHttp = function () {
            $scope.loader = true;
            SecurityRestService.updateUser({
                username: $scope.user.username,
                pass: ($scope.noPassword) ? '' : $scope.user.password || undefined,
                appSettings: $scope.user.appSettings,
                grantedAuthorities: $scope.user.grantedAuthorities
            }).success(function () {
                toastr.success('The user ' + $scope.user.username + ' was updated.');
                const timer = $timeout(function () {
                    $scope.loader = false;
                    $window.history.back();
                }, 2000);
                $scope.$on('$destroy', function () {
                    $timeout.cancel(timer);
                });
                // if we update the settings of the currently logged user, update the principal
                if ($scope.user.username === $jwtAuth.getPrincipal().username) {
                    $jwtAuth.getPrincipal().appSettings = $scope.user.appSettings;
                }
            }).error(function (data) {
                const msg = getError(data);
                $scope.loader = false;
                toastr.error(msg, 'Error');
            });
        };

        $scope.validateForm = function () {
            return $scope.validatePassword();
        };
    }]);

securityCtrl.controller('RolesMappingController', ['$scope', 'toastr', 'SecurityRestService',
    function ($scope, toastr, SecurityRestService) {

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
                toastr.error(msg, 'Error');
            });
    };

    $scope.$on('repositoryIsSet', function () {
        loadRoles();
    });
}]);

securityCtrl.controller('ChangeUserPasswordSettingsCtrl', ['$scope', 'toastr', '$window', '$timeout', '$jwtAuth', '$rootScope', '$controller', 'SecurityRestService', 'ModalService',
    function ($scope, toastr, $window, $timeout, $jwtAuth, $rootScope, $controller, SecurityRestService, ModalService) {

        angular.extend(this, $controller('CommonUserCtrl', {$scope: $scope}));

        $scope.mode = 'settings';
        $scope.hasEditRestrictions = function () {
            return true;
        };
        $scope.saveButtonText = 'Save';
        $scope.goBack = function () {
            const timer = $timeout(function () {
                $window.history.back();
            }, 100);
            $scope.$on('$destroy', function () {
                $timeout.cancel(timer);
            });
        };
        $scope.currentUserData = function () {
            return $jwtAuth.getPrincipal();
        };

        $scope.updateCurrentUserData = function () {
            _.assign($jwtAuth.getPrincipal(), $scope.userData);
        };

        //call it as a function so I can make test on it
        $scope.redirectAdmin = function () {
            if (!$scope.currentUserData()) {
                $rootScope.redirectToLogin();
            }
        };

        $scope.pageTitle = 'Settings';
        $scope.passwordPlaceholder = 'New password';
        $scope.grantedAuthorities = {
            [READ_REPO]: {},
            [WRITE_REPO]: {}
        };

        const initUserData = function (scope) {
            // Copy needed so that Cancel would work correctly, need to call updateCurrentUserData on OK
            scope.userData = angular.copy(scope.currentUserData());
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
        };

        if ($scope.currentUserData()) {
            initUserData($scope);
        } else {
            $scope.$on('securityInit', function (scope) {
                scope.currentScope.redirectAdmin();
                initUserData(scope.currentScope);
            });
        }

        $scope.loader = false;

        $scope.submit = function () {
            const pa = parseAuthorities($scope.userData.authorities);
            $scope.userType = pa.userType;
            if ($scope.noPassword &&  $scope.userType === UserType.ADMIN) {
                ModalService.openSimpleModal({
                    title: 'Save user settings',
                    message: 'If you unset the password and then enable security, that user will not be ' +
                        'able to log into GraphDB through the workbench. Are you sure that you want to continue?',
                    warning: true
                }).result.then(function () {
                    $scope.updateUser();
                });
            } else {
                $scope.updateUser();
            }
        }

        $scope.updateUserHttp = function () {
            $scope.loader = true;
            SecurityRestService.updateUserData({
                username: $scope.user.username,
                pass: ($scope.noPassword) ? '' : $scope.user.password || undefined,
                appSettings: $scope.user.appSettings
            }).success(function () {
                $scope.updateCurrentUserData();
                toastr.success('The user ' + $scope.user.username + ' was updated.');
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
                toastr.error(msg, 'Error');
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
    }]);

securityCtrl.controller('DeleteUserCtrl', ['$scope', '$modalInstance', 'username', function ($scope, $modalInstance, username) {
    $scope.username = username;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
