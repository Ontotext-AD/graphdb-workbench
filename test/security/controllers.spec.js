import 'angular/security/controllers';
import {FakeModal} from '../mocks';
import {bundle} from "../test-main";

beforeEach(angular.mock.module('graphdb.framework.security.controllers'));

describe('==> Controllers tests', function () {

    describe('=> LoginCtrl tests', function () {
        var $jwtAuth,
            $httpBackend,
            $location,
            $controller,
            $rootScope,
            $scope,
            $window,
            $timeout,
            httpLogin;
        let $translate;

        beforeEach(angular.mock.inject(function (_$jwtAuth_, _$httpBackend_, _$location_, _$controller_, _$window_, _$timeout_, _$rootScope_, _$translate_) {
            $jwtAuth = _$jwtAuth_;
            $httpBackend = _$httpBackend_;
            $location = _$location_;
            $controller = _$controller_;
            $window = _$window_;
            $timeout = _$timeout_;
            $translate = _$translate_;

            $translate.instant = function (key, modification) {
                if (modification) {
                    let modKey = Object.keys(modification)[0];
                    return bundle[key].replace(`{{${modKey}}}`, modification[modKey]);
                }
                return bundle[key];
            };

            $rootScope = _$rootScope_;
            $scope = _$rootScope_.$new();
            var controller = $controller('LoginCtrl', {$scope: $scope});

            httpLogin = $httpBackend.when('POST', 'rest/login', function (data) {
                return data === '{"username":"username","password":"password"}';
            }).respond(200, '');

            var httpSecurity = $httpBackend.when('GET', 'rest/security/all').respond(200, {
                enabled: true,
                freeAccess: {enabled: false},
                overrideAuth: {enabled: false}
            });
            var httpGetActiveLocation = $httpBackend.when('GET', 'rest/locations/active').respond(200, {});
            var httpGetRepositories = $httpBackend.when('GET', 'rest/repositories').respond(200, {});

            $httpBackend.when('GET', 'rest/security/authenticated-user').respond(401, 'Authentication required');
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should redirect to home page on login', function () {
            $httpBackend.flush();
            $httpBackend.expectPOST('rest/login');
            $scope.username = 'username';
            $scope.password = 'password';

            $scope.login();
            $httpBackend.flush();
            // Should wait for redirection to happen
            $timeout(function () {
                expect($location.url()).toEqual('/');
            }, 2000);
        });

        it('should redirect to saved page on login', function () {
            $httpBackend.flush();
            $httpBackend.expectPOST('rest/login');
            $rootScope.returnToUrl = '/sparql';
            $scope.username = 'username';
            $scope.password = 'password';

            $scope.login();
            $httpBackend.flush();

            // Should wait for redirection to happen
            $timeout(function () {
                expect($location.url()).toEqual('/sparql');
            }, 2000);
        });

        it('should clear login data on wrong credentials', function () {
            $httpBackend.flush();
            httpLogin.respond(401, {});
            $httpBackend.expectPOST('rest/login');

            $scope.username = 'username';
            $scope.password = 'password';

            $scope.login();
            $httpBackend.flush();

            expect($scope.username).toEqual('');
            expect($scope.password).toEqual('');
            expect($scope.wrongCredentials).toEqual(true);
        })
    });

    describe('=> UsersCtrl tests', function () {
        var $jwtAuth,
            $httpBackend,
            $location,
            $controller,
            $scope,
            $timeout,
            httpGetUsers,
            windowMock,
            modalInstance;

        beforeEach(angular.mock.inject(function (_$jwtAuth_, _$httpBackend_, _$location_, _$controller_, _$timeout_, $rootScope, $q) {
            $jwtAuth = _$jwtAuth_;
            $httpBackend = _$httpBackend_;
            $location = _$location_;
            $controller = _$controller_;
            $timeout = _$timeout_;
            modalInstance = new FakeModal($q, $rootScope);

            windowMock = {location: {reload: jasmine.createSpy('windowMock.location.reload')}};
            $scope = $rootScope.$new();
            var controller = $controller('UsersCtrl', {
                $scope: $scope,
                $window: windowMock,
                $uibModal: modalInstance,
                ModalService: {
                    openSimpleModal: function () {
                        return modalInstance;
                    }
                }
            });

            httpGetUsers = $httpBackend.when('GET', 'rest/security/users').respond(200, []);

            var httpSecurity = $httpBackend.when('GET', 'rest/security/all').respond(200, {
                enabled: true,
                freeAccess: {enabled: false},
                overrideAuth: {enabled: false}
            });
            var httpGetActiveLocation = $httpBackend.when('GET', 'rest/locations/active').respond(200, {});
            var httpGetRepositories = $httpBackend.when('GET', 'rest/repositories').respond(200, {});
            $httpBackend.when('GET', 'rest/security/free-access').respond(200, {enabled: false});
            $httpBackend.when('GET', 'rest/security/authenticated-user').respond(401, 'Authentication required');
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        describe('$scope.getUsers tests', function () {
            it('load users data correct', function () {
                $httpBackend.expectGET('rest/security/users');
                $httpBackend.flush();

                expect($scope.users).toEqual([]);
                expect($scope.loader).toEqual(false);
            })
        });

        describe('$scope.toggleSecurity', function () {
            it('should reload location when toggle to true', function () {
                $httpBackend.expectGET('rest/security/users');
                $httpBackend.flush();
                $jwtAuth.toggleSecurity = function () {
                    return;
                };
                $jwtAuth.isSecurityEnabled = function () {
                    return true;
                };

                $scope.toggleSecurity();
                $timeout.flush();
                expect(windowMock.location.reload).toHaveBeenCalled();
            })
        });

        describe('$scope.toggleFreeAccess()', function () {
            it('should call $jwtAuth.toggleFreeAccess() on isFreeAccessEnabled == true', function () {
                $httpBackend.flush();
                $jwtAuth.isFreeAccessEnabled = function () {
                    return true;
                };
                var toggleFreeAccess = {};
                $jwtAuth.toggleFreeAccess = function (isFreeAccessDisabled, authorities) {
                    toggleFreeAccess = {isFreeAccessDisabled: isFreeAccessDisabled, authorities: authorities}
                };
                modalInstance.open = jasmine.createSpy('modal.open');
                $scope.toggleFreeAccess();
                expect(modalInstance.open).not.toHaveBeenCalled();
                expect(toggleFreeAccess).toEqual({isFreeAccessDisabled: false, authorities: []})
            });

            it('should open $uibModal and call $jwtAuth.toggleFreeAccess() on $uibModal.close', function () {
                $httpBackend.expectGET('rest/security/free-access');
                $jwtAuth.isFreeAccessEnabled = function () {
                    return false;
                };
                var toggleFreeAccess = {};
                $jwtAuth.toggleFreeAccess = function (isFreeAccessDisabled, authorities, appSettings) {
                    toggleFreeAccess = {isFreeAccessDisabled: isFreeAccessDisabled, authorities: authorities, appSettings: appSettings}
                };

                $scope.toggleFreeAccess();
                modalInstance.close({authorities: ['someAuthorities'], appSettings: {'s1': 'v1'}});
                $httpBackend.flush();
                expect(toggleFreeAccess).toEqual({isFreeAccessDisabled: true, authorities: ['someAuthorities'], appSettings: {'s1': 'v1'}})
            });
        });

        describe('$scope.removeUser()', function () {
            it('should open $uibModal and call $http.delete on $uibModal.close', function () {
                $httpBackend.flush();
                $httpBackend.expectDELETE('rest/security/users/username').respond(200, '');
                $scope.getUsers = jasmine.createSpy('scope.getUsers');

                $scope.removeUser('username');
                modalInstance.close();
                $httpBackend.flush();
                expect($scope.getUsers).toHaveBeenCalled();
            });

            it('should open $uibModal and not call $http.delete on $uibModal.dismiss', function () {
                $httpBackend.flush();
                $scope.getUsers = jasmine.createSpy('scope.getUsers');
                $scope.removeUser('username');
                modalInstance.dismiss();
                expect($scope.getUsers).not.toHaveBeenCalled();
            });
        });
    });

    describe('=> DefaultAuthoritiesCtrl tests', function () {
        var $controller,
            $scope,
            modalInstance;

        beforeEach(angular.mock.inject(function (_$controller_, $rootScope) {
            $controller = _$controller_;
            modalInstance = {                    // Create a mock object using spies
                close: jasmine.createSpy('modalInstance.close')
            };

            $scope = $rootScope.$new();

            $scope.getActiveLocation = function () {
                return {uri: ''}
            };

            var controller = $controller('DefaultAuthoritiesCtrl', {
                $scope: $scope, $uibModalInstance: modalInstance,
                data: {
                    defaultAuthorities: function () {
                        return {}
                    }, appSettings: {}
                }
            });
        }));

        describe('$scope.ok', function () {
            //All cases are in different "it" because otherwise toHaveBeenCalledWith() return true even if the array is wrong one
            it('should return correct auth obj on close', function () {
                $scope.grantedAuthorities = {'READ_REPO': {'myrepo': true}, 'WRITE_REPO': {}};
                $scope.appSettings = {'s1': 'v1'};
                $scope.ok();
                expect(modalInstance.close).toHaveBeenCalledWith({authorities: ['READ_REPO_myrepo'], appSettings: {'s1': 'v1'}});
            });

            it('should validate at least one authority', function () {
                $scope.grantedAuthorities = {'READ_REPO': {}, 'WRITE_REPO': {}};
                $scope.appSettings = {'s1': 'v1'};
                $scope.ok();
                expect(modalInstance.close).not.toHaveBeenCalled();
            });

            it('should return correct auth obj on close', function () {
                $scope.grantedAuthorities = {
                    'READ_REPO': {'myrepo': true},
                    'WRITE_REPO': {'myrepo': true, 'location2_repo': true}
                };
                $scope.appSettings = {'s1': 'v1'};
                $scope.ok();
                expect(modalInstance.close).toHaveBeenCalledWith({
                    authorities: ['WRITE_REPO_myrepo', 'READ_REPO_myrepo', 'WRITE_REPO_location2_repo', 'READ_REPO_location2_repo'],
                    appSettings: {'s1': 'v1'}
                });
            });

            it('should return correct auth obj on close', function () {
                $scope.grantedAuthorities = {
                    'READ_REPO': {'myrepo2': true},
                    'WRITE_REPO': {'myrepo': true, 'location2_repo': true}
                };
                $scope.appSettings = {'s1': 'v1'};
                $scope.ok();
                expect(modalInstance.close).toHaveBeenCalledWith({
                    authorities: ['WRITE_REPO_myrepo', 'READ_REPO_myrepo', 'WRITE_REPO_location2_repo', 'READ_REPO_location2_repo', 'READ_REPO_myrepo2'],
                    appSettings: {'s1': 'v1'}
                });
            });

            it('should return correct auth obj on close', function () {
                $scope.grantedAuthorities = {
                    'READ_REPO': {'myrepo2': false},
                    'WRITE_REPO': {'myrepo': true, 'location2_repo': false}
                };
                $scope.appSettings = {'s1': 'v1'};
                $scope.ok();
                expect(modalInstance.close).toHaveBeenCalledWith({
                    authorities: ['WRITE_REPO_myrepo', 'READ_REPO_myrepo'],
                    appSettings: {'s1': 'v1'}
                });
            });
        });
    });

    describe('=> AddUserCtrl tests', function () {
        var $controller,
            $scope,
            $httpBackend,
            $timeout,
            httpCreateUser,
            windowMock;
        let $translate;

        beforeEach(angular.mock.inject(function (_$controller_, _$httpBackend_, _$timeout_, $rootScope, _$translate_) {
            $controller = _$controller_;
            $httpBackend = _$httpBackend_;
            $timeout = _$timeout_;
            $translate = _$translate_;

            $translate.instant = function (key, modification) {
                if (modification) {
                    let modKey = Object.keys(modification)[0];
                    return bundle[key].replace(`{{${modKey}}}`, modification[modKey]);
                }
                return bundle[key];
            };

            httpCreateUser = $httpBackend.when('POST', "rest/security/users/testov", {
                "password": "testova",
                "grantedAuthorities": [],
                "appSettings": {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true, 'IGNORE_SHARED_QUERIES': false, 'DEFAULT_VIS_GRAPH_SCHEMA': true}
            }).respond(201, '');

            windowMock = {history: {back: jasmine.createSpy('windowMock.history.back')}};

            $scope = $rootScope.$new();

            $scope.getActiveLocation = function () {
                return {uri: ''}
            };

            var controller = $controller('AddUserCtrl', {$scope: $scope, $window: windowMock});

            var httpSecurity = $httpBackend.when('GET', 'rest/security/all').respond(200, {
                enabled: true,
                freeAccess: {enabled: false},
                overrideAuth: {enabled: false}
            });
            var httpGetActiveLocation = $httpBackend.when('GET', 'rest/locations/active').respond(200, {});
            var httpGetRepositories = $httpBackend.when('GET', 'rest/repositories').respond(200, {});

            $httpBackend.when('GET', 'rest/security/authenticated-user').respond(401, 'Authentication required');

            $scope.user.username = 'testov';
            $scope.user.password = 'testova';
            $scope.user.confirmpassword = 'testova';
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        describe('$scope.setGrantedAuthorities', function () {
            it('should set $scope.user.grantedAuthorities correct', function () {
                $httpBackend.flush();

                $scope.userType = 'admin';
                $scope.grantedAuthorities = {'READ_REPO': {}, 'WRITE_REPO': {}};
                $scope.setGrantedAuthorities();
                expect($scope.user.grantedAuthorities).toEqual(['ROLE_ADMIN']);
                expect($scope.repositoryCheckError).toEqual(false);

                $scope.userType = 'repoManager';
                $scope.grantedAuthorities = {'READ_REPO': {}, 'WRITE_REPO': {}};
                $scope.setGrantedAuthorities();
                expect($scope.user.grantedAuthorities).toEqual(['ROLE_REPO_MANAGER']);
                expect($scope.repositoryCheckError).toEqual(false);

                $scope.userType = 'user';
                $scope.grantedAuthorities = {'READ_REPO': {}, 'WRITE_REPO': {}};
                $scope.customRoles = ['ROLE1'];
                $scope.setGrantedAuthorities();
                expect($scope.user.grantedAuthorities).toEqual(['ROLE_USER', 'CUSTOM_ROLE1']);
                expect($scope.repositoryCheckError).toEqual(true);

                $scope.userType = 'user';
                $scope.grantedAuthorities = {'READ_REPO': {'myrepo': true}, 'WRITE_REPO': {}};
                $scope.customRoles = ['ROLE2'];
                $scope.setGrantedAuthorities();
                expect($scope.user.grantedAuthorities).toEqual(['ROLE_USER', 'READ_REPO_myrepo', 'CUSTOM_ROLE2']);
                expect($scope.repositoryCheckError).toEqual(false);

                $scope.userType = 'user';
                $scope.grantedAuthorities = {'READ_REPO': {}, 'WRITE_REPO': {'myrepo': true}};
                $scope.customRoles = null;
                $scope.setGrantedAuthorities();
                expect($scope.user.grantedAuthorities).toEqual(['ROLE_USER', 'WRITE_REPO_myrepo', 'READ_REPO_myrepo']);
                expect($scope.repositoryCheckError).toEqual(false);
            });
        });

        describe('$scope.createUserHttp', function () {
            it('should make window.history.back after successful registration', function () {
                $httpBackend.flush();
                $scope.createUserHttp();
                $httpBackend.expectPOST("rest/security/users/testov");
                $httpBackend.flush();
                $timeout.flush();
                expect(windowMock.history.back).toHaveBeenCalled();
            });
        });

        describe('$scope.validateForm', function () {
            it('should return correct value', function () {
                $httpBackend.flush();
                $scope.user.username = '';
                $scope.user.password = '';
                $scope.user.confirmpassword = '';

                expect($scope.validateForm()).toEqual(false);
                expect($scope.usernameError).toEqual('Enter username!');
                expect($scope.passwordError).toEqual('Enter password!');
                expect($scope.confirmPasswordError).toEqual('Confirm password!');

                $scope.user.username = 'username';
                expect($scope.validateForm()).toEqual(false);
                expect($scope.passwordError).toEqual('Enter password!');
                expect($scope.confirmPasswordError).toEqual('Confirm password!');

                $scope.user.password = 'password';
                expect($scope.validateForm()).toEqual(false);
                expect($scope.passwordError).toEqual('');
                expect($scope.confirmPasswordError).toEqual('Confirm password!');

                $scope.user.password = '';
                $scope.user.confirmpassword = 'password';
                expect($scope.validateForm()).toEqual(false);
                expect($scope.passwordError).toEqual('Enter password!');
                expect($scope.confirmPasswordError).toEqual('Confirm password!');

                $scope.user.password = 'password';
                $scope.user.confirmpassword = 'wrong-password';
                expect($scope.validateForm()).toEqual(false);
                expect($scope.passwordError).toEqual('');
                expect($scope.confirmPasswordError).toEqual('Confirm password!');

                $scope.user.password = 'password';
                $scope.user.confirmpassword = 'password';
                expect($scope.validateForm()).toEqual(true);
                expect($scope.passwordError).toEqual('');
                expect($scope.confirmPasswordError).toEqual('');

                $scope.user.username = '';
                expect($scope.validateForm()).toEqual(false);
                expect($scope.usernameError).toEqual('Enter username!');
                expect($scope.passwordError).toEqual('');
                expect($scope.confirmPasswordError).toEqual('');
            });
        });
    });

    describe('=> EditUserCtrl tests', function () {
        var $controller,
            $scope,
            $httpBackend,
            $timeout,
            httpGetUserData,
            httpEditUser,
            windowMock,
            jwtMock;
        let $translate;

        beforeEach(angular.mock.inject(function (_$controller_, _$httpBackend_, _$timeout_, $rootScope, _$translate_) {
            $controller = _$controller_;
            $httpBackend = _$httpBackend_;
            $timeout = _$timeout_;
            $translate = _$translate_;

            $translate.instant = function (key, modification) {
                if (modification) {
                    let modKey = Object.keys(modification)[0];
                    return bundle[key].replace(`{{${modKey}}}`, modification[modKey]);
                }
                return bundle[key];
            };

            httpGetUserData = $httpBackend.when('GET', "rest/security/users/editedUser")
                .respond(200, {
                    "username": "editedUser",
                    "password": "",
                    "confirmpassword": "",
                    "grantedAuthorities": ['ROLE_ADMIN'],
                    "external": false,
                    "appSettings": {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true}
                });

            httpEditUser = $httpBackend.when('PUT', "rest/security/users/editedUser", {
                "grantedAuthorities": ['ROLE_ADMIN'],
                "appSettings": {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true}
            }).respond(200, '');

            windowMock = {history: {back: jasmine.createSpy('windowMock.history.back')}};

            jwtMock = {
                hasRole: function () {
                    return false
                },
                getPrincipal: function () {
                    return Promise.resolve({
                        "username": "user",
                        "password": "",
                        "confirmpassword": "",
                        "external": false,
                        "authorities": ['ROLE_USER', 'WRITE_REPO_myrepo', 'READ_REPO_myrepo'],
                        "appSettings": {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true}
                    });
                }
            };

            $scope = $rootScope.$new();

            $scope.getActiveLocation = function () {
                return {uri: 'locationUri'}
            };

            var controller = $controller('EditUserCtrl',
                {
                    $scope: $scope,
                    $window: windowMock,
                    $routeParams: {userId: 'editedUser'},
                    $jwtAuth: jwtMock,
                });

            var httpSecurity = $httpBackend.when('GET', 'rest/security/all').respond(200, {
                enabled: true,
                freeAccess: {enabled: false},
                overrideAuth: {enabled: false}
            });
            var httpGetActiveLocation = $httpBackend.when('GET', 'rest/locations/active').respond(200, {});
            var httpGetRepositories = $httpBackend.when('GET', 'rest/repositories').respond(200, {});
            $httpBackend.when('GET', 'rest/security/authenticated-user').respond(401, 'Authentication required');
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        describe('$scope.getUserData', function () {
            it('should set admin user data correct', function () {
                $httpBackend.expectGET("rest/security/users/editedUser");
                $httpBackend.flush();
                expect($scope.mode).toEqual("edit");
                expect($scope.userData).toEqual({
                    "username": "editedUser",
                    "password": "",
                    "confirmpassword": "",
                    "grantedAuthorities": ['ROLE_ADMIN'],
                    "external": false,
                    "appSettings": {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true}
                });
                expect($scope.user).toEqual({
                    username: 'editedUser',
                    "password": "",
                    "confirmpassword": "",
                    "external": false,
                    "appSettings": {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true}
                });
                expect($scope.grantedAuthorities).toEqual({READ_REPO: {}, WRITE_REPO: {}});
                expect($scope.userType).toEqual('admin');
            });

            it('should set standard user data correct', function () {
                httpGetUserData.respond(200, {
                    "username": "editedUser",
                    "password": "",
                    "confirmpassword": "",
                    "grantedAuthorities": ['ROLE_USER', 'READ_REPO_myrepo', 'WRITE_REPO_myrepo'],
                    "external": false,
                    "appSettings": {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true}
                });
                $httpBackend.expectGET("rest/security/users/editedUser");
                $httpBackend.flush();
                expect($scope.userData).toEqual({
                    "username": "editedUser",
                    "password": "",
                    "confirmpassword": "",
                    "grantedAuthorities": ['ROLE_USER', 'READ_REPO_myrepo', 'WRITE_REPO_myrepo'],
                    "external": false,
                    "appSettings": {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true}
                });
                expect($scope.grantedAuthorities).toEqual({READ_REPO: {'myrepo': true}, WRITE_REPO: {'myrepo': true}});
                expect($scope.userType).toEqual('user');
            });
        });

        describe('$scope.updateUserHttp', function () {
            it('should make $window.history.back() after success registration', function () {
                $scope.user = {
                    "username": "editedUser",
                    "password": "",
                    "confirmpassword": "",
                    "grantedAuthorities": ['ROLE_ADMIN'],
                    "external": false,
                    "appSettings": {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true}
                };
                $httpBackend.expectPUT("rest/security/users/editedUser");
                $scope.updateUserHttp();
                $httpBackend.flush();
                $timeout.flush();
                expect($scope.loader).toEqual(false);
                expect(windowMock.history.back).toHaveBeenCalled();
            });
        });

        describe('$scope.validateForm', function () {
            it('should return correct value', function () {
                $httpBackend.flush();
                $scope.user.password = '';
                $scope.user.confirmpassword = '';

                //empty password and confirm
                expect($scope.validateForm()).toEqual(true);
                expect($scope.passwordError).toEqual('');
                expect($scope.confirmPasswordError).toEqual('');

                //Added pass without confirmation
                $scope.user.password = 'password';
                expect($scope.validateForm()).toEqual(false);
                expect($scope.passwordError).toEqual('');
                expect($scope.confirmPasswordError).toEqual('Confirm password!');

                //Added password with wrong confirm
                $scope.user.password = 'password';
                $scope.user.confirmpassword = 'wrong-password';
                expect($scope.validateForm()).toEqual(false);
                expect($scope.passwordError).toEqual('');
                expect($scope.confirmPasswordError).toEqual('Confirm password!');

                //Added password with correct confirm
                $scope.user.confirmpassword = 'password';
                expect($scope.validateForm()).toEqual(true);
                expect($scope.passwordError).toEqual('');
                expect($scope.confirmPasswordError).toEqual('');
            });
        });
    });
});
