import "angular/repositories/services";
import "angular/repositories/controllers";
import 'lib/ng-file-upload.min';
import 'lib/ng-file-upload-shim.min';

describe('==> Repository module controllers tests', function () {

    beforeEach(angular.mock.module('graphdb.framework.repositories.controllers'));


    describe('=> LocationsAndRepositories tests', function () {
        var $repositories,
            $httpBackend,
            $location,
            $window,
            $controller,
            $timeout,
            $scope,
            httpGetLocation,
            httpGetActiveLocation,
            httpGetRepositories,
            modalInstance,
            modalServiceMock,
            jwtAuthMock,
            httpSecurity,
            httpDefaultUser;

        beforeEach(angular.mock.inject(function (_$repositories_, _$httpBackend_, _$location_, _$controller_, _$window_, _$timeout_, $rootScope, $q) {
            $repositories = _$repositories_;
            $httpBackend = _$httpBackend_;
            $location = _$location_;
            $controller = _$controller_;
            $window = _$window_;
            $timeout = _$timeout_;

            function FakeModal() {
                this.resultDeferred = $q.defer();
                this.result = this.resultDeferred.promise;
            }

            FakeModal.prototype.open = function () {
                return this;
            };

            FakeModal.prototype.openSimpleModal = function () {
                return this;
            };

            FakeModal.prototype.openCopyToClipboardModal = function () {
                return this;
            };

            FakeModal.prototype.close = function (item) {
                this.resultDeferred.resolve(item);
                $rootScope.$apply(); // Propagate promise resolution to 'then' functions using $apply().
            };
            FakeModal.prototype.dismiss = function (item) {
                this.resultDeferred.reject(item);
                $rootScope.$apply(); // Propagate promise resolution to 'then' functions using $apply().
            };

            modalInstance = new FakeModal();

            jwtAuthMock = {};

            $scope = $rootScope.$new();
            var controller = $controller('LocationsAndRepositoriesCtrl', {
                $scope: $scope,
                $modal: modalInstance,
                ModalService: modalInstance,
                $jwtAuth: jwtAuthMock
            });


            httpGetLocation = $httpBackend.when('GET', 'rest/locations').respond(200, {});
            httpGetActiveLocation = $httpBackend.when('GET', 'rest/locations/active').respond(200, {});
            httpGetRepositories = $httpBackend.when('GET', 'rest/repositories').respond(200, {});
            httpSecurity = $httpBackend.when('GET', 'rest/security/all').respond(200, {
                enabled: false,
                overrideAuth: {enabled: false},
                freeAccess: {enabled: false}
            });
            httpDefaultUser = $httpBackend.when('GET', 'rest/security/user/admin').respond(200, {
                username: 'admin',
                appSettings: {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true},
                authorities: ['ROLE_ADMIN']
            });

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
                var test = false;
                $repositories.init = function () {
                    test = true
                };
                $httpBackend.expectPUT('rest/locations', {}).respond(200, {locations: ['some new location']});
                $scope.editLocationHttp({});
                $httpBackend.flush();
                expect($scope.locations).toEqual({locations: ['some new location']});
                expect(test).toBeTruthy();
            })
        });

        describe('$scope.activateLocationRequest()', function () {
            it('should call $repositories.init() and setRepository() on success', function () {
                $httpBackend.flush();
                var init = false,
                    repository = 'some repository';
                $repositories.init = function () {
                    init = true
                };
                $repositories.setRepository = function (id) {
                    repository = id
                };
                $httpBackend.expectPOST('rest/locations/activate').respond(200, '');
                $scope.activateLocationRequest({
                    'uri': 'uri'
                });
                $httpBackend.flush();
                expect(init).toBeTruthy();
                expect(repository).toEqual('');
            })
        });

        describe('$scope.deleteLocation()', function () {
            it('should call $repositories.deleteLocation on modal confirm', function () {
                $httpBackend.flush();
                var deleteLocation = '';
                $repositories.deleteLocation = function (uri) {
                    deleteLocation = uri;
                };
                $scope.deleteLocation('uri');
                modalInstance.close();
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

        describe('$scope.activateLocation()', function () {
            it('should call $scope.activateLocationRequest() on modal confirm', function () {
                var dummyElement = document.createElement('input');
                dummyElement.checked = false;
                dummyElement.id = 'switch-1';
                document.getElementById = jasmine.createSpy('HTML Element').and.returnValue(dummyElement);
                $httpBackend.flush();
                $scope.hasActiveLocation = function () {
                    return true;
                };
                var activateLocationRequest = {};
                $scope.activateLocationRequest = function (location) {
                    activateLocationRequest = location;
                };
                $scope.activateLocation({uri: 'uri', '$$hashKey': 1});
                modalInstance.close();
                expect(activateLocationRequest).toEqual({uri: 'uri', '$$hashKey': 1});
            });
            it('should set element checked to false on modal reject', function () {
                var dummyElement = document.createElement('input');
                dummyElement.checked = false;
                $scope.hasActiveLocation = function () {
                    return true;
                };
                dummyElement.id = 'switch-1';
                document.getElementById = jasmine.createSpy('HTML Element').and.returnValue(dummyElement);
                $httpBackend.flush();
                var activateLocationRequest = {};
                $scope.activateLocationRequest = function (location) {
                    activateLocationRequest = location;
                };
                $scope.activateLocation({uri: 'uri', '$$hashKey': 1});
                dummyElement.checked = true;
                modalInstance.dismiss();
                expect(dummyElement.checked).toBeFalsy();
            });
            it('should not open modal and call $scope.activateLocationRequest() if there is not activeLocation', function () {
                var dummyElement = document.createElement('input');
                dummyElement.checked = false;
                $scope.hasActiveLocation = function () {
                    return false;
                };
                dummyElement.id = 'switch-1';
                document.getElementById = jasmine.createSpy('HTML Element').and.returnValue(dummyElement);
                modalInstance.open = jasmine.createSpy('modal.open');
                $httpBackend.flush();
                var activateLocationRequest = {};
                $scope.activateLocationRequest = function (location) {
                    activateLocationRequest = location;
                };
                $scope.activateLocation({uri: 'uri', '$$hashKey': 1});
                dummyElement.checked = true;
                expect(modalInstance.open).not.toHaveBeenCalled();
                expect(activateLocationRequest).toEqual({uri: 'uri', '$$hashKey': 1});
            });
            it('should not open modal and not call $scope.activateLocationRequest() if the input is checked', function () {
                $httpBackend.flush();
                var dummyElement = document.createElement('input');
                dummyElement.checked = true;
                $scope.hasActiveLocation = function () {
                    return true;
                };
                modalInstance.open = jasmine.createSpy('modal.open');
                dummyElement.id = 'switch-1';
                document.getElementById = jasmine.createSpy('HTML Element').and.returnValue(dummyElement);
                $scope.activateLocationRequest = jasmine.createSpy('$scope.activateLocationRequest');
                $scope.activateLocation({uri: 'uri', '$$hashKey': 1});
                expect(modalInstance.open).not.toHaveBeenCalled();
                expect($scope.activateLocationRequest).not.toHaveBeenCalled();
            })
        });

        describe('$scope.deleteRepository()', function () {
            it('should call $repositories.deleteRepository() on modal.close()', function () {
                $httpBackend.flush();
                var deleteRepository = '';
                $repositories.deleteRepository = function (id) {
                    deleteRepository = id;
                };
                $scope.deleteRepository('id');
                modalInstance.close();
                expect(deleteRepository).toEqual('id');
            })
        });
    });

    describe('=> AddRepositoryCtrl tests', function () {
        describe('isEnterprice == true', function () {
            var $repositories,
                $httpBackend,
                $controller,
                $scope,
                locationMock,
                routeParamsMock,
                isEnterprise,
                isFreeEdition,
                httpDefaultUser,
                httpSecurity;

            beforeEach(angular.mock.inject(function (_$repositories_, _$httpBackend_, _$controller_, $rootScope) {
                $repositories = _$repositories_;
                $httpBackend = _$httpBackend_;
                $controller = _$controller_;

                isEnterprise = true;
                isFreeEdition = false;
                locationMock = {path: jasmine.createSpy('locationMock.path')};
                routeParamsMock = {repositoryId: 'repo'};

                $scope = $rootScope.$new();
                var controller = $controller('AddRepositoryCtrl', {
                    $scope: $scope,
                    $location: locationMock,
                    $routeParams: routeParamsMock,
                    isEnterprise: isEnterprise,
                    isFreeEdition: isFreeEdition
                });
                httpDefaultUser = $httpBackend.when('GET', 'rest/security/user/admin').respond(200, {
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

            it('should call $scope.getConfig with "worker" when isEnterprise', function () {
                $httpBackend.expectGET('rest/security/all');
                $httpBackend.expectGET('rest/repositories/defaultConfig/worker').respond(200, '');
                $httpBackend.expectGET('rest/locations/active').respond(200, {locationUri: ''});
                expect($httpBackend.flush).not.toThrow();
            });

            it('$scope.createRepoHttp() should call $repositories.init() and change location to /repository', function () {
                $httpBackend.expectGET('rest/security/all');
                $httpBackend.expectGET('rest/repositories/defaultConfig/worker').respond(200, '');
                $httpBackend.expectGET('rest/locations/active').respond(200, {locationUri: ''});
                $httpBackend.flush();
                $scope.repositoryInfo = {};
                $httpBackend.expectPOST('rest/repositories', {}).respond(200, '');
                var init = false;
                $repositories.init = function (callback) {
                    init = true;
                    callback();
                };
                $scope.createRepoHttp();
                $httpBackend.flush();

                expect(init).toBeTruthy();
                expect(locationMock.path).toHaveBeenCalledWith('/repository');

            });
        });

        describe('isEnterprise == false', function () {
            var $httpBackend,
                $controller,
                $scope,
                routeParamsMock,
                isEnterprise,
                isFreeEdition,
                httpDefaultUser,
                httpSecurity;

            beforeEach(angular.mock.inject(function (_$httpBackend_, _$controller_, $rootScope) {
                $httpBackend = _$httpBackend_;
                $controller = _$controller_;

                routeParamsMock = {repositoryId: 'repo'};
                isEnterprise = false;
                isFreeEdition = false;

                $scope = $rootScope.$new();
                var controller = $controller('AddRepositoryCtrl', {
                    $scope: $scope,
                    $routeParams: routeParamsMock,
                    isEnterprise: isEnterprise,
                    isFreeEdition: isFreeEdition
                });
                httpDefaultUser = $httpBackend.when('GET', 'rest/security/user/admin').respond(200, {
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

            it('should call $scope.getConfig with "se" when !isEnterprise', function () {
                $httpBackend.expectGET('rest/security/all');
                $httpBackend.expectGET('rest/repositories/defaultConfig/se').respond(200, '');
                $httpBackend.expectGET('rest/locations/active').respond(200, {locationUri: ''});
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
            isEnterprise,
            routeParamsMock,
            isFreeEdition,
            init = false;

        beforeEach(angular.mock.inject(function (_$httpBackend_, _$controller_, $rootScope) {
            $httpBackend = _$httpBackend_;
            $controller = _$controller_;
            repositoriesMock = {
                hasActiveLocation: function () {
                    return false;
                }, init: function (callback) {
                    init = true;
                    callback();
                }
            };
            routeParamsMock = {repositoryId: 'repo'};
            isEnterprise = true;
            isFreeEdition = false;
            locationMock = {path: jasmine.createSpy('locationMock.path')};

            $scope = $rootScope.$new();
            var controller = $controller('EditRepositoryCtrl', {
                $scope: $scope,
                $location: locationMock,
                isEnterprise: isEnterprise,
                isFreeEdition: isFreeEdition,
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
