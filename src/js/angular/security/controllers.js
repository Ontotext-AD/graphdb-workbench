import 'angular/core/services';
import 'angular/security/services';

const modules = [
    'ngCookies',
    'ui.bootstrap',
    'graphdb.framework.security.services',
    'toastr'
];

const securityCtrl = angular.module('graphdb.framework.security.controllers', modules);

var setGrantedAuthorities = function ($scope) {
    function pushAuthority() {
        for (var i = 0; i < arguments.length; i++) {
            var authority = arguments[i];
            if (_.indexOf($scope.user.grantedAuthorities, authority) < 0) {
                $scope.user.grantedAuthorities.push(authority);
            }
        }
    }

    $scope.user.grantedAuthorities = [];

    $scope.repositoryCheckError = true;
    if ($scope.userType === 'admin') {
        $scope.repositoryCheckError = false;
        pushAuthority('ROLE_ADMIN');
    } else if ($scope.userType === 'repoManager') {
        $scope.repositoryCheckError = false;
        pushAuthority('ROLE_REPO_MANAGER');
    } else {
        pushAuthority('ROLE_USER');
        for (var index in $scope.grantedAuthorities.WRITE_REPO) {
            if ($scope.grantedAuthorities.WRITE_REPO[index]) {
                $scope.repositoryCheckError = false;
                pushAuthority('WRITE_REPO_' + index, 'READ_REPO_' + index);
            }
        }
        for (var index in $scope.grantedAuthorities.READ_REPO) {
            if ($scope.grantedAuthorities.READ_REPO[index]) {
                $scope.repositoryCheckError = false;
                pushAuthority('READ_REPO_' + index);
            }
        }
    }
}

var getUserRoleName = function (userType) {
    switch (userType) {
        case 'user':
            return 'User';
        case 'repoManager':
            return 'Repository manager';
        case 'admin':
            return 'Administrator';
        default:
            return 'Unknown';
    }
};

var parseAuthorities = function (authorities) {
    var userType = 'user';
    var grantedAuthorities = {'READ_REPO': {}, 'WRITE_REPO': {}};
    var repositories = {};
    for (var i = 0; i < authorities.length; i++) {
        var role = authorities[i];
        if (role === 'ROLE_ADMIN') {
            userType = 'admin';
        } else if (role === 'ROLE_REPO_MANAGER') {
            if (userType !== 'admin') {
                userType = 'repoManager';
            }
        } else if (role === 'ROLE_USER') {
            if (!userType) {
                userType = 'user';
            }
        } else if (role.indexOf('ROLE_') !== 0) {
            var index = role.indexOf('_', role.indexOf('_') + 1);
            var op = role.substr(0, index);
            var repo = role.substr(index + 1);
            grantedAuthorities[op][repo] = true;
            repositories[repo] = repositories[repo] || {};
            if (op === 'READ_REPO') {
                repositories[repo].read = true;
            } else if (op === 'WRITE_REPO') {
                repositories[repo].write = true;
            }
        }
    }

    return {
        userType: userType,
        userTypeDescription: getUserRoleName(userType),
        grantedAuthorities: grantedAuthorities,
        repositories: repositories
    }
};

securityCtrl.controller('LoginCtrl', ['$scope', '$http', 'toastr', '$jwtAuth', '$window', '$timeout', '$location', '$cookies', '$rootScope',
    function ($scope, $http, toastr, $jwtAuth, $window, $timeout, $location, $cookies, $rootScope) {
        $scope.username = "";
        $scope.password = "";

        $scope.login = function () {
            $http({
                method: 'POST',
                url: 'rest/login/' + encodeURIComponent($scope.username),
                headers: {
                    'X-GraphDB-Password': $scope.password
                }
            }).success(function (data, status, headers, config) {
                $jwtAuth.authenticate(data, headers);
                // toastr.success("Signed in", "Welcome");
                var timer = $timeout(function () {
                    if ($rootScope.returnToUrl) {
                        // go back to remembered url
                        $location.url($rootScope.returnToUrl);
                    } else {
                        // no remembered url, go to home
                        $location.path('/');
                    }
                }, 500);
                $scope.$on("$destroy", function (event) {
                    $timeout.cancel(timer);
                });
            }).error(function (data, status, headers, config) {
                if (status == 401) {
                    toastr.error('Wrong credentials!', 'Error');
                    $scope.wrongCredentials = true;
                    $scope.username = "";
                    $scope.password = "";
                }
                else {
                    msg = getError(data);
                    toastr.error(msg, status);
                }

            });
        }
    }]);

securityCtrl.controller('UsersCtrl', ['$scope', '$http', '$modal', 'toastr', '$window', '$jwtAuth', '$timeout', 'ModalService',
    function ($scope, $http, $modal, toastr, $window, $jwtAuth, $timeout, ModalService) {

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
            $http.get('rest/security/user').success(function (data, status, headers, config) {
                $scope.users = data;
                for (var i = 0; i < $scope.users.length; i++) {
                    var pa = parseAuthorities($scope.users[i].grantedAuthorities);
                    $scope.users[i].userType = pa.userType;
                    $scope.users[i].userTypeDescription = pa.userTypeDescription;
                    $scope.users[i].repositories = pa.repositories;
                }
                $scope.loader = false;
            }).error(function (data, status, headers, config) {
                var msg = getError(data);
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
                var timer = $timeout(function () {
                    $window.location.reload();
                }, 500);
                $scope.$on("$destroy", function (event) {
                    $timeout.cancel(timer);
                });
            }
        };

        $scope.toggleFreeAccess = function (updateFreeAccess) {
            if (!$jwtAuth.isFreeAccessEnabled() || ($jwtAuth.isFreeAccessEnabled() && updateFreeAccess)) {
                $http.get('rest/security/freeaccess').then(function (res) {
                    var authorities = res.data.authorities;
                    var appSettings = res.data.appSettings || {
                        'DEFAULT_SAMEAS': true,
                        'DEFAULT_INFERENCE': true,
                        'EXECUTE_COUNT': true,
                        'IGNORE_SHARED_QUERIES': false
                    };
                    var modalInstance = $modal.open({
                        templateUrl: 'js/angular/security/templates/modal/default-authorities.html',
                        controller: 'DefaultAuthoritiesCtrl',
                        resolve: {
                            data: function () {
                                return {
                                    // converts the array rights to hash ones. why, oh, why do we have both formats?
                                    defaultAuthorities: function () {
                                        var defaultAuthorities = {'READ_REPO': {}, 'WRITE_REPO': {}};
                                        // We might have old (no longer existing) repositories so we have to check that
                                        var repoIds = _.mapKeys($scope.getRepositories(), function (r) {
                                            return r.id
                                        });
                                        _.each(authorities, function (a) {
                                            // indexOf works in IE 11, startsWith doesn't
                                            if (a.indexOf('WRITE_REPO_') === 0) {
                                                if (repoIds.hasOwnProperty(a.substr(11))) {
                                                    defaultAuthorities['WRITE_REPO'][a.substr(11)] = true;
                                                }
                                            } else if (a.indexOf('READ_REPO_') === 0) {
                                                if (repoIds.hasOwnProperty(a.substr(10))) {
                                                    defaultAuthorities['READ_REPO'][a.substr(10)] = true;
                                                }
                                            }
                                        });
                                        return defaultAuthorities;
                                    },
                                    appSettings: appSettings
                                }
                            }
                        }
                    });
                    modalInstance.result.then(function (data) {
                        authorities = data.authorities;
                        appSettings = data.appSettings;
                        $jwtAuth.toggleFreeAccess(updateFreeAccess || !$jwtAuth.isFreeAccessEnabled(), authorities, appSettings, updateFreeAccess);
                    });
                });
            }
            else {
                $jwtAuth.toggleFreeAccess(!$jwtAuth.isFreeAccessEnabled(), []);
            }
        }

        $scope.editFreeAccess = function () {
            $scope.toggleFreeAccess(true);
        }

        $scope.removeUser = function (username) {
            ModalService.openSimpleModal({
                title: 'Confirm delete',
                message: "Are you sure you want to delete the user '" + username + "'?",
                warning: true
            }).result.then(function () {
                $scope.loader = true;
                $http.delete('rest/security/user/' + encodeURIComponent(username)).success(function (data, status, headers, config) {
                    $scope.getUsers();

                }).error(function (data, status, headers, config) {
                    msg = getError(data);
                    toastr.error(msg, 'Error');

                    $scope.loader = false;
                });

            });
        }

        // Should be able to send the original username to $routeParams
        $scope.encodeURIComponent = function (name) {
            return encodeURIComponent(name);
        }
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
            var auth = [];
            $scope.repositoryCheckError = true;
            for (var index in $scope.grantedAuthorities.WRITE_REPO) {
                if ($scope.grantedAuthorities.WRITE_REPO[index]) {
                    auth.push('WRITE_REPO_' + index);
                    auth.push('READ_REPO_' + index);
                    $scope.repositoryCheckError = false;
                }
            }
            for (var index in $scope.grantedAuthorities.READ_REPO) {
                if ($scope.grantedAuthorities.READ_REPO[index] && auth.indexOf('READ_REPO_' + index) == -1) {
                    auth.push('READ_REPO_' + index);
                    $scope.repositoryCheckError = false;
                }
            }
            if (!$scope.repositoryCheckError) {
                $modalInstance.close({authorities: auth, appSettings: $scope.appSettings});
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        }
    }]);

securityCtrl.controller('CommonUserCtrl', ['$scope', '$http', 'toastr', '$window', '$timeout', '$location', '$jwtAuth',
    function ($scope, $http, toastr, $window, $timeout, $location, $jwtAuth) {

        $scope.isAdmin = function () {
            return $jwtAuth.hasRole('ROLE_ADMIN');
        };
        $scope.hasExternalAuth = function () {
            return $jwtAuth.hasExternalAuth();
        };
        $scope.hasEditRestrictions = function () {
            return $scope.user && $scope.user.username === 'admin';
        };

        $scope.isOverrideAuth = function () {
            return $jwtAuth.isDefaultAuthEnabled();
        };

        $scope.setGrantedAuthorities = function () {
            setGrantedAuthorities($scope);
        };

        $scope.hasReadPermission = function (repositoryId) {
            return $scope.userType === 'admin' || $scope.userType === 'repoManager'
                || $scope.grantedAuthorities.READ_REPO[repositoryId]
                || $scope.grantedAuthorities.WRITE_REPO[repositoryId]
                || repositoryId !== 'SYSTEM'
                && ($scope.grantedAuthorities.READ_REPO['*'] || $scope.grantedAuthorities.WRITE_REPO['*']);
        };

        $scope.hasWritePermission = function (repositoryId) {
            return $scope.userType === 'admin' || $scope.userType === 'repoManager'
                || $scope.grantedAuthorities.WRITE_REPO[repositoryId]
                || repositoryId !== 'SYSTEM' && $scope.grantedAuthorities.WRITE_REPO['*'];
        };

        $scope.readCheckDisabled = function (repositoryId) {
            return $scope.hasWritePermission(repositoryId)
                || repositoryId !== 'SYSTEM' && repositoryId !== '*' && $scope.grantedAuthorities.READ_REPO['*']
                || $scope.hasEditRestrictions();
        };

        $scope.writeCheckDisabled = function (repositoryId) {
            return $scope.userType === 'admin' || $scope.userType === 'repoManager'
                || repositoryId !== 'SYSTEM' && repositoryId !== '*' && $scope.grantedAuthorities.WRITE_REPO['*']
                || $scope.hasEditRestrictions();
        };

        $scope.userType = 'user';
        $scope.grantedAuthorities = {'READ_REPO': {}, 'WRITE_REPO': {}};

    }]);

securityCtrl.controller('AddUserCtrl', ['$scope', '$http', 'toastr', '$window', '$timeout', '$location', '$jwtAuth', '$controller',
    function ($scope, $http, toastr, $window, $timeout, $location, $jwtAuth, $controller) {

        angular.extend(this, $controller('CommonUserCtrl', {$scope: $scope}));

        $scope.mode = 'add';
        $scope.saveButtonText = "Create";
        $scope.goBack = function () {
            var timer = $timeout(function () {
                $window.history.back();
            }, 100);
            $scope.$on("$destroy", function (event) {
                $timeout.cancel(timer);
            });
        };
        $scope.pageTitle = 'Create new user';
        $scope.passwordPlaceholder = "Password";

        $scope.user = {
            "username": "",
            "password": "",
            "confirmpassword": "",
            "grantedAuthorities": [],
            "appSettings": {
                'DEFAULT_SAMEAS': true,
                'DEFAULT_INFERENCE': true,
                'EXECUTE_COUNT': true,
                'IGNORE_SHARED_QUERIES': false
            }
        };

        $scope.submit = function () {
            $scope.createUser();
        };


        $scope.createUserHttp = function () {
            $scope.loader = true;
            $http({
                method: 'POST',
                url: "rest/security/user/" + encodeURIComponent($scope.user.username),
                headers: {
                    'X-GraphDB-Password': $scope.user.password
                },
                data: {
                    appSettings: $scope.user.appSettings,
                    grantedAuthorities: $scope.user.grantedAuthorities
                }
            }).success(function (data, status, headers, config) {
                toastr.success('The user ' + $scope.user.username + ' has been created.');
                var timer = $timeout(function () {
                    $scope.loader = false;
                    $window.history.back();
                }, 2000);
                $scope.$on("$destroy", function (event) {
                    $timeout.cancel(timer);
                });
            }).error(function (data, status, headers, config) {
                msg = getError(data);
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
            var result = true;
            if (!$scope.user.username) {
                $scope.usernameError = 'Enter username!';
                result = false;
            } else {
                $scope.usernameError = '';
            }
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
            return result;
        }
    }]);

securityCtrl.controller('EditUserCtrl', ['$scope', '$http', 'toastr', '$window', '$routeParams', '$timeout', '$location', '$jwtAuth', '$controller',
    function ($scope, $http, toastr, $window, $routeParams, $timeout, $location, $jwtAuth, $controller) {

        angular.extend(this, $controller('CommonUserCtrl', {$scope: $scope}));

        $scope.mode = 'edit';
        $scope.saveButtonText = "Save";
        $scope.goBack = function () {
            var timer = $timeout(function () {
                $window.history.back();
            }, 100);
            $scope.$on("$destroy", function (event) {
                $timeout.cancel(timer);
            });
        };
        $scope.params = $routeParams;
        $scope.pageTitle = 'Edit user: ' + $scope.params.userId;
        $scope.passwordPlaceholder = "New password";
        $scope.userType = 'user';
        var defaultUserSettings = {
            'DEFAULT_SAMEAS': true,
            'DEFAULT_INFERENCE': true,
            'EXECUTE_COUNT': true,
            'IGNORE_SHARED_QUERIES': false
        };

        if (!$jwtAuth.hasRole('ROLE_ADMIN')) {
            $location.url('settings');
        }
        $scope.getUserData = function () {
            $http.get('rest/security/user/' + encodeURIComponent($scope.params.userId)).success(function (data, status, headers, config) {
                $scope.userData = data;
                $scope.user = {username: $scope.userData.username}
                $scope.user.password = '';
                $scope.user.confirmpassword = '';
                $scope.user.external = $scope.userData.external;
                $scope.user.appSettings = data.appSettings || defaultUserSettings
                $scope.userType = 'user';
                var pa = parseAuthorities(data.grantedAuthorities);
                $scope.userType = pa.userType;
                $scope.grantedAuthorities = pa.grantedAuthorities;
            }).error(function (data, status, headers, config) {
                msg = getError(data);
                toastr.error(msg, 'Error');
            });
        };

        $scope.getUserData();

        $scope.submit = function () {
            $scope.updateUser();
        };

        $scope.updateUserHttp = function () {
            $scope.loader = true;
            $http({
                method: 'PUT',
                url: "rest/security/user/" + encodeURIComponent($scope.user.username),
                headers: {
                    'X-GraphDB-Password': $scope.user.password
                },
                data: {
                    appSettings: $scope.user.appSettings,
                    grantedAuthorities: $scope.user.grantedAuthorities
                }
            }).success(function (data, status, headers, config) {
                toastr.success('The user ' + $scope.user.username + ' was updated.');
                var timer = $timeout(function () {
                    $scope.loader = false;
                    $window.history.back();
                }, 2000);
                $scope.$on("$destroy", function (event) {
                    $timeout.cancel(timer);
                });
                // if we update the settings of the currently logged user, update the principal
                if ($scope.user.username === $jwtAuth.getPrincipal().username) {
                    $jwtAuth.getPrincipal().appSettings = $scope.user.appSettings;
                }
            }).error(function (data, status, headers, config) {
                msg = getError(data);
                $scope.loader = false;
                toastr.error(msg, 'Error');
            });
        };

        $scope.updateUser = function () {

            if (!$scope.validateForm()) {
                return false;
            }

            $scope.setGrantedAuthorities();

            if (!$scope.repositoryCheckError) {
                $scope.updateUserHttp();
            }
        };

        $scope.validateForm = function () {
            var result = true;
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
            return result;
        }

    }]);

securityCtrl.controller('RolesMappingController', ['$scope', '$http', function ($scope, $http) {
    $scope.debugMapping = function (role, mapping) {
        var method = mapping.split(':');
        $http.get('rest/roles/mapping', {
            params: {
                role: role,
                method: mapping.split(':')[1],
                mapping: mapping.split(':')[0]
            }
        })
    }

    $scope.$on("repositoryIsSet", function (event) {
        loadRoles();
    });

    var loadRoles = function () {
        $http.get('rest/roles')
            .success(function (data, status, headers, config) {
                $scope.roleMappings = data;
                $scope.roles = _.keys($scope.roleMappings);
                $scope.mappings = _.keys($scope.roleMappings[$scope.roles[0]]);
                var permissionsCount = _.map($scope.roles, function (role) {
                    return [role, _.filter($scope.roleMappings[role]).length]
                });
                $scope.roles = _.reverse(_.map(_.orderBy(permissionsCount, function (p) {
                    return p[1]
                }), function (p) {
                    return p[0]
                }))


            })
            .error(function (data, status, headers, config) {
                msg = getError(data);
                $scope.loader = false;
                toastr.error(msg, 'Error');
            });
    }


}]);

securityCtrl.controller('ChangeUserPasswordSettingsCtrl', ['$scope', '$http', 'toastr', '$window', '$timeout', '$location', '$jwtAuth', '$rootScope', '$controller',
    function ($scope, $http, toastr, $window, $timeout, $location, $jwtAuth, $rootScope, $controller) {

        angular.extend(this, $controller('CommonUserCtrl', {$scope: $scope}));

        $scope.mode = 'settings';
        $scope.hasEditRestrictions = function () {
            return true
        };
        $scope.saveButtonText = "Save";
        $scope.goBack = function () {
            var timer = $timeout(function () {
                $window.history.back();
            }, 100);
            $scope.$on("$destroy", function (event) {
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
        $scope.passwordPlaceholder = "New password";
        $scope.grantedAuthorities = {'READ_REPO': {}, 'WRITE_REPO': {}};


        var initUserData = function (scope) {
            // Copy needed so that Cancel would work correctly, need to call updateCurrentUserData on OK
            scope.userData = angular.copy(scope.currentUserData());
            scope.user = {username: scope.userData.username};
            scope.user.password = '';
            scope.user.confirmpassword = '';
            scope.user.external = scope.userData.external;
            scope.user.appSettings = scope.userData.appSettings;

            var pa = parseAuthorities(scope.userData.authorities);
            $scope.userType = pa.userType;
            $scope.grantedAuthorities = pa.grantedAuthorities;
        };

        if ($scope.currentUserData()) {
            initUserData($scope);
        } else {
            $scope.$on('securityInit', function (scope, securityEnabled, userLoggedIn, freeAccess) {
                scope.currentScope.redirectAdmin();
                initUserData(scope.currentScope);
            });
        }

        $scope.loader = false;

        $scope.submit = function () {
            $scope.updateUser();
        };

        $scope.updateUserHttp = function () {
            $scope.loader = true;
            $http({
                method: 'PATCH',
                url: "rest/security/user/" + encodeURIComponent($scope.user.username),
                headers: {
                    'X-GraphDB-Password': $scope.user.password
                },
                data: {
                    appSettings: $scope.user.appSettings
                }
            }).success(function (data, status, headers, config) {
                $scope.updateCurrentUserData();
                toastr.success('The user ' + $scope.user.username + ' was updated.');
                var timer = $timeout(function () {
                    $scope.loader = false;
                    $window.history.back();
                }, 2000);
                $scope.$on("$destroy", function (event) {
                    $timeout.cancel(timer);
                });
            }).error(function (data, status, headers, config) {
                msg = getError(data);
                $scope.loader = false;
                toastr.error(msg, 'Error');
            });
        };

        $scope.updateUser = function () {

            if (!$scope.validateForm()) {
                return false;
            }

            $scope.setGrantedAuthorities();

            if (!$scope.repositoryCheckError) {
                $scope.updateUserHttp();
            }
        };


        $scope.validateForm = function () {
            var result = true;
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
            return result;
        }
    }]);

securityCtrl.controller('DeleteUserCtrl', ["$scope", "$modalInstance", "username", function ($scope, $modalInstance, username) {
    $scope.username = username;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
