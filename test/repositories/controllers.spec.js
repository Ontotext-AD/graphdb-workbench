import 'angular/core/services/repositories.service';
import "angular/repositories/controllers";
import 'ng-file-upload/dist/ng-file-upload.min';
import 'ng-file-upload/dist/ng-file-upload-shim.min';
import {FakeModal} from '../mocks';
import {bundle} from "../test-main";

describe('==> Repository module controllers tests', function () {

    beforeEach(angular.mock.module('graphdb.framework.repositories.controllers'));
    beforeEach(angular.mock.module('graphdb.framework.guides.services'));

    describe('=> LocationsAndRepositories tests', function () {
        let $repositories;
        let $httpBackend;
        let $location;
        let $window;
        let $controller;
        let $timeout;
        let $scope;
        let httpGetLocation;
        let httpGetActiveLocation;
        let httpGetRepositories;
        let modalInstance;
        let jwtAuthMock;
        let httpSecurity;
        let httpDefaultUser;
        let $translate;
        let $q;
        let GuidesService;

        beforeEach(angular.mock.inject(function (_$repositories_, _$httpBackend_, _$location_, _$controller_, _$window_, _$timeout_, $rootScope, _$q_, _$translate_, _GuidesService_) {
            $repositories = _$repositories_;
            $httpBackend = _$httpBackend_;
            $location = _$location_;
            $controller = _$controller_;
            $window = _$window_;
            $timeout = _$timeout_;
            $translate = _$translate_;
            $q = _$q_;
            GuidesService = _GuidesService_;

            modalInstance = new FakeModal($q, $rootScope);

            jwtAuthMock = {};

            $translate.instant = function (key, modification) {
                if (modification) {
                    let modKey = Object.keys(modification)[0];
                    return bundle[key].replace(`{{${modKey}}}`, modification[modKey]);
                }
                return bundle[key];
            };

            $scope = $rootScope.$new();
            var controller = $controller('LocationsAndRepositoriesCtrl', {
                $scope: $scope,
                $uibModal: modalInstance,
                ModalService: modalInstance,
                $jwtAuth: jwtAuthMock,
                $rootScope: $rootScope,
                $translate: $translate,
                $q: $q,
                GuidesService: GuidesService
            });

            httpGetLocation = $httpBackend.when('GET', 'rest/locations?filterClusterLocations=true').respond(200, [{}]);
            httpGetActiveLocation = $httpBackend.when('GET', 'rest/locations/active').respond(200, {});
            httpGetRepositories = $httpBackend.when('GET', 'rest/repositories').respond(200, {});
            httpSecurity = $httpBackend.when('GET', 'rest/security/all').respond(200, {
                enabled: false,
                overrideAuth: {enabled: false},
                freeAccess: {enabled: false}
            });
            httpDefaultUser = $httpBackend.when('GET', 'rest/security/users/admin').respond(200, {
                username: 'admin',
                appSettings: {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true},
                authorities: ['ROLE_ADMIN']
            });

            GuidesService.isActive = function () {
                return false;
            };
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        describe('$scope.addLocationHttp()', function () {
            it('should call $repositories.init() on success', function () {
                $httpBackend.flush();
                var test = false;
                $repositories.init = function () {
                    test = true
                };
                $httpBackend.expectPOST('rest/locations', {}).respond(200, '');
                $scope.addLocationHttp({});
                $httpBackend.flush();
                expect(test).toBeTruthy();
            })
        });

        describe('$scope.editLocationHttp()', function () {
            it('should call $repositories.init() on success', function () {
                $httpBackend.flush();
                $timeout.flush();
                var test = false;
                $repositories.init = function () {
                    test = true
                };
                $httpBackend.expectPUT('rest/locations', {}).respond(200, {locations: ['some new location']});
                $httpBackend.expectGET('rest/locations?filterClusterLocations=true').respond(200, {locations: ['some new location']});
                $scope.editLocationHttp({});
                $httpBackend.flush();
                expect($scope.locations).toEqual({locations: ['some new location']});
                expect(test).toBeTruthy();
            })
        });

        describe('$scope.deleteLocation()', function () {
            it('should call $repositories.deleteLocation on modal confirm', function () {
                var deleteLocation = '';
                $repositories.deleteLocation = function (uri) {
                    const deferred = $q.defer();
                    deferred.resolve(uri);
                    return deferred.promise.then(() => deleteLocation = uri);
                };
                $scope.deleteLocation('uri');
                modalInstance.close();
                $httpBackend.flush();
                expect(deleteLocation).toEqual('uri');
            })
        });

        describe('$scope.addLocation()', function () {
            it('should call $scope.addLocationHttp() on modal confirm', function () {
                $httpBackend.flush();
                var addLocationHttp = {};
                $scope.addLocationHttp = function (location) {
                    addLocationHttp = location;
                };
                $scope.addLocation();
                modalInstance.close({uri: 'uri'});
                expect(addLocationHttp).toEqual({uri: 'uri'});
            })
        });

        describe('$scope.editLocation()', function () {
            it('should call $scope.editLocationHttp() on modal confirm', function () {
                $httpBackend.flush();
                var editLocationHttp = {};
                $scope.editLocationHttp = function (location) {
                    editLocationHttp = location;
                };
                $scope.editLocation();
                modalInstance.close({uri: 'uri'});
                expect(editLocationHttp).toEqual({uri: 'uri'});
            })
        });

        describe('$scope.deleteRepository()', function () {
            it('should call $repositories.deleteRepository() on modal.close()', function () {
                const repo = {id: 'testrepo', location: ''};
                $repositories.repository = repo;
                $repositories.repositories.set('', [repo]);
                spyOn(modalInstance, 'openSimpleModal').and.returnValue(modalInstance);
                $httpBackend.expectDELETE(`rest/repositories/${repo.id}?location=`).respond(200);

                $scope.deleteRepository(repo);

                const argument = modalInstance.openSimpleModal.calls.first().args[0];
                expect(argument).toEqual({
                    title: 'Confirm delete',
                    message: `<p>Are you sure you want to delete the repository <strong>${repo.id}</strong>?</p><p><span class="icon-2x icon-warning" style="color: var(--primary-color-dark)"></span>All data in the repository will be lost.</p>`,
                    warning: true
                });

                modalInstance.close();
                $httpBackend.flush();

                expect($scope.loader).toEqual(false);
            });
        });
    });

    describe('=> AddRepositoryCtrl tests', function () {
        describe('isEnterprise() == true', function () {
            let $repositories;
            let $httpBackend;
            let $controller;
            let $scope;
            let locationMock;
            let routeParamsMock;
            let httpDefaultUser;
            let httpSecurity;
            let toastr;
            let createController;
            let $translate;
            let $q;
            let $timeout;

            beforeEach(angular.mock.inject(function (_toastr_, _$repositories_, _$httpBackend_, _$controller_, $rootScope, _$translate_, _$q_, _$timeout_) {
                toastr = _toastr_;
                $repositories = _$repositories_;
                $httpBackend = _$httpBackend_;
                $controller = _$controller_;
                $translate = _$translate_;
                $q = _$q_;
                $timeout = _$timeout_;
                $translate.instant = function (key) {
                    return bundle[key];
                };

                $httpBackend.when('GET', 'rest/locations?filterClusterLocations=true').respond(200, [{}]);

                locationMock = {path: jasmine.createSpy('locationMock.path')};
                routeParamsMock = {repositoryId: 'repo', repositoryType: 'graphdb'};

                $scope = $rootScope.$new();

                $scope.isEnterprise = function () {
                    return true;
                };
                $scope.isFreeEdition = function () {
                    return false;
                };

                createController = () => {
                    $controller('AddRepositoryCtrl', {
                        $scope: $scope,
                        $location: locationMock,
                        $routeParams: routeParamsMock,
                        $translate: $translate
                    });
                };

                createController();

                httpDefaultUser = $httpBackend.when('GET', 'rest/security/users/admin').respond(200, {
                    username: 'admin',
                    appSettings: {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true},
                    authorities: ['ROLE_ADMIN']
                });
                httpSecurity = $httpBackend.when('GET', 'rest/security/all').respond(200, {
                    enabled: false,
                    overrideAuth: {enabled: false},
                    freeAccess: {enabled: false}
                });
            }));

            afterEach(function () {
                $httpBackend.verifyNoOutstandingExpectation();
                $httpBackend.verifyNoOutstandingRequest();
            });

            it('should call $scope.getConfig with "graphdb" when isEnterprise()', function () {
                $httpBackend.expectGET('rest/security/all');
                $httpBackend.expectGET('rest/repositories/default-config/graphdb').respond(200, {
                        params: { param1: 'param1'},
                        type: 'graphdb'
                    });
                $httpBackend.flush();
                $httpBackend.expectGET('rest/locations/active').respond(200, {locationUri: ''});
                $timeout.flush();

                $httpBackend.flush();

                expect($scope.repositoryInfo.params).toEqual({ param1: 'param1'});
                expect($scope.repositoryInfo.type).toEqual('graphdb');
                expect($scope.loader).toEqual(false);
            });

            it('should show notification if getting configuration fails', () => {
                spyOn(toastr, 'error');
                $httpBackend.when('GET', 'rest/locations/active').respond(200, {locationUri: ''});
                $httpBackend.when('GET', 'rest/repositories/default-config/graphdb').respond(500, {
                    error: {
                        message: 'Get repo config error!'
                    }
                });

                $httpBackend.flush();

                expect(toastr.error).toHaveBeenCalledWith('Get repo config error!', 'Error');
                expect($scope.loader).toEqual(false);
            });

            it('$scope.createRepoHttp() should call $repositories.init() and change location to /repository', function () {
                $httpBackend.expectGET('rest/security/all');
                $httpBackend.expectGET('rest/repositories/default-config/graphdb').respond(200, '');
                $httpBackend.flush();
                $httpBackend.expectGET('rest/locations/active').respond(200, {locationUri: ''});
                $timeout.flush();
                $httpBackend.flush();
                $scope.repositoryInfo = {};
                $httpBackend.expectPOST('rest/repositories', {}).respond(200, '');
                var init = false;
                $repositories.init = function () {
                    init = true;
                    const deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                };
                $scope.createRepoHttp();
                $httpBackend.flush();

                expect(init).toBeTruthy();
                expect(locationMock.path).toHaveBeenCalledWith('/repository');

            });
        });

        describe('isEnterprise() == false', function () {
            var $httpBackend,
                $controller,
                $scope,
                routeParamsMock,
                httpDefaultUser,
                httpSecurity;
            let $timeout;

            beforeEach(angular.mock.inject(function (_$httpBackend_, _$controller_, $rootScope, _$timeout_) {
                $httpBackend = _$httpBackend_;
                $controller = _$controller_;
                $timeout = _$timeout_;

                $httpBackend.when('GET', 'rest/locations?filterClusterLocations=true').respond(200, [{}]);

                routeParamsMock = {repositoryId: 'repo', repositoryType: 'graphdb'};

                $scope = $rootScope.$new();
                $scope.isEnterprise = function () {
                    return false;
                };
                $scope.isFreeEdition = function () {
                    return false;
                };
                var controller = $controller('AddRepositoryCtrl', {
                    $scope: $scope,
                    $routeParams: routeParamsMock
                });
                httpDefaultUser = $httpBackend.when('GET', 'rest/security/users/admin').respond(200, {
                    username: 'admin',
                    appSettings: {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true},
                    authorities: ['ROLE_ADMIN']
                });
                httpSecurity = $httpBackend.when('GET', 'rest/security/all').respond(200, {
                    enabled: false,
                    overrideAuth: {enabled: false},
                    freeAccess: {enabled: false}
                });

            }));

            afterEach(function () {
                $httpBackend.verifyNoOutstandingExpectation();
                $httpBackend.verifyNoOutstandingRequest();
            });

            it('should call $scope.getConfig with "graphdb" when !isEnterprise()', function () {
                $httpBackend.expectGET('rest/security/all');
                $httpBackend.expectGET('rest/repositories/default-config/graphdb').respond(200, '');
                expect($httpBackend.flush).not.toThrow();
                $httpBackend.expectGET('rest/locations/active').respond(200, {locationUri: ''});
                $timeout.flush();
                expect($httpBackend.flush).not.toThrow();
            });
        });
    });

    describe('=> EditRepositoryCtrl tests', function () {
        var repositoriesMock,
            $httpBackend,
            $controller,
            $scope,
            locationMock,
            routeParamsMock,
            isFreeEdition,
            init = false;

        beforeEach(angular.mock.inject(function (_$httpBackend_, _$controller_, $rootScope, $q) {
            $httpBackend = _$httpBackend_;
            $controller = _$controller_;
            repositoriesMock = {
                hasActiveLocation: function () {
                    return false;
                }, init: function () {
                    init = true;
                    const deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                },
                getLocations: function () {
                    const deferred = $q.defer();
                    deferred.resolve([{uri: '', label: 'Local', local: true}]);
                    return deferred.promise;
                }
            };

            $httpBackend.when('GET', 'rest/locations?filterClusterLocations=true').respond(200, [{}]);
            $httpBackend.when('GET', 'rest/monitor/repo/operations').respond(200, {});
            routeParamsMock = {repositoryId: 'repo'};
            locationMock = {path: jasmine.createSpy('locationMock.path')};

            $scope = $rootScope.$new();
            $scope.isEnterprise = function () {
                return true;
            };
            $scope.isFreeEdition = function () {
                return false;
            };
            var controller = $controller('EditRepositoryCtrl', {
                $scope: $scope,
                $location: locationMock,
                $routeParams: routeParamsMock,
                $repositories: repositoriesMock,
                ModalService: {
                    openSimpleModal: function () {
                        return this;
                    }
                }
            });

        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('$scope.editRepoHttp() should call $repositories.init() and should go back to previous location /repositories or /', function () {
            $scope.repositoryInfo = {id: 'repo', saveId: 'repo'};
            $scope.editRepoHttp();
            $httpBackend.expectPUT('rest/repositories/repo', {id: 'repo', saveId: "repo"}).respond(200, '');
            $httpBackend.expectGET('rest/repositories/repo').respond(200, {"params": {}});
            $httpBackend.flush();


            expect(init).toBeTruthy();
            expect(locationMock.path).toHaveBeenCalledWith('/repository');
        });
    });
});
