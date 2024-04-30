import "angular/core/services";
import 'angular/core/interceptors/unauthorized.interceptor';
import 'angular/core/services/jwt-auth.service';
import 'angular/core/services/repositories.service';
import "angular/namespaces/controllers";
import "angular/rest/rdf4j.repositories.rest.service";
import {FakeModal} from '../mocks';
import {bundle} from "../test-main";

beforeEach(angular.mock.module('graphdb.framework.namespaces.controllers', function ($provide) {
    $provide.constant("productInfo", {
        "productType": "standard", "productVersion": "7.0", "sesame": "2.9.0", "connectors": "5.0.0"
    });
}));

describe('=> NamespacesCtrl tests', function () {
    var $httpBackend,
        $controller,
        $timeout,
        $scope,
        $repositories,
        RDF4JRepositoriesRestService,
        toastr,
        httpGetNamespaces,
        modalInstance,
        $translate,
        $licenseService;

    beforeEach(angular.mock.inject(function (_$httpBackend_, _$repositories_, _RDF4JRepositoriesRestService_, _toastr_, _$location_, _$controller_, _$window_, _$timeout_, $rootScope, $q, _$translate_, _$licenseService_) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        $timeout = _$timeout_;
        $repositories = _$repositories_;
        RDF4JRepositoriesRestService = _RDF4JRepositoriesRestService_;
        toastr = _toastr_;
        $scope = $rootScope.$new();
        $translate = _$translate_;
        $licenseService = _$licenseService_;

        $translate.instant = function (key) {
            return bundle[key];
        };

        modalInstance = new FakeModal($q, $rootScope);
        $licenseService.isLicenseValid = function () {
            return true;
        }
        $httpBackend.when('GET', 'rest/graphdb-settings/license').respond(200, 'licenseinfo');
        $httpBackend.when('GET', 'rest/graphdb-settings/license/hardcoded').respond(200, 'true');
        $httpBackend.when('GET', 'rest/locations').respond(200, {});

        $repositories.getActiveRepositoryObject = function () {
            return {id: 'activeRepository', location: ''};
        }

        $httpBackend.when('GET', 'rest/security/all').respond(200, {
            enabled: false,
            freeAcesss: {enabled: false},
            overrideAuth: {enabled: false}
        });
        $httpBackend.when('GET', 'rest/locations/active').respond(200, '');
        $httpBackend.when('GET', 'rest/security/users/admin').respond(200, {
            username: 'admin',
            appSettings: {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true},
            authorities: ['ROLE_ADMIN']
        });

        httpGetNamespaces = $httpBackend.when('GET', 'repositories/activeRepository/namespaces').respond(200, {
            "head": {
                "vars": ["prefix", "namespace"]
            },
            "results": {
                "bindings": [{
                    "prefix": {
                        "type": "literal",
                        "value": "prefix"
                    },
                    "namespace": {
                        "type": "literal",
                        "value": "namespace"
                    }
                }, {
                    "prefix": {
                        "type": "literal",
                        "value": "prefix2"
                    },
                    "namespace": {
                        "type": "literal",
                        "value": "namespace2"
                    }
                }]
            }
        });

        $repositories.getActiveRepository = function () {
            return 'activeRepository';
        };

        var controller = $controller('NamespacesCtrl', {
            $scope: $scope,
            $uibModal: modalInstance,
            RDF4JRepositoriesRestService: RDF4JRepositoriesRestService,
            toastr: toastr,
            ModalService: {
                openSimpleModal: function () {
                    return modalInstance;
                }
            },
            $translate: $translate,
            $licenseService: $licenseService
        });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('$scope.getNamespaces()', function () {
        it('should set $scope.namespaces', function () {
            $httpBackend.flush();
            expect($scope.namespaces).toEqual([{prefix: 'prefix', namespace: 'namespace'}, {
                prefix: 'prefix2',
                namespace: 'namespace2'
            }]);
            // loader will be set to false by loaderPostRepeatDirective
            expect($scope.loader).toBeTruthy();
        });
    });

    describe('$scope.saveNamespace()', function () {
        it('should call $scope.getNamespaces()', function () {
            $httpBackend.flush();
            $timeout.flush();
            $httpBackend.expectPUT('repositories/activeRepository/namespaces/prefix', 'namespace').respond(200, '');
            var getNamespaces = false;
            $scope.getNamespaces = function () {
                getNamespaces = true;
            };
            $scope.saveNamespace('prefix', 'namespace');
            $httpBackend.flush();
            expect(getNamespaces).toBeTruthy();
        });
    });

    describe('$scope.addNamespace()', function () {
        it('should call $scope.saveNamespace() if prefix exist', function() {
            $scope.form = {
                $setUntouched: () => {},
                $setPristine: () => {}
            };
            $httpBackend.flush();

            $scope.namespace = {prefix: 'prefix', namespace: 'newNamespace'};
            var saveNamespace = {};
            $scope.saveNamespace = function (prefix, namespace) {
                saveNamespace = {prefix: prefix, namespace: namespace}
            };
            $scope.addNamespace();
            modalInstance.close();
            expect(saveNamespace).toEqual({prefix: 'prefix', namespace: 'newNamespace'});
            expect($scope.namespace).toEqual({prefix: '', namespace: ''});
        });

        it('should call $scope.saveNamespace() if prefix not exist', function () {
            $scope.form = {
                $setUntouched: () => {},
                $setPristine: () => {}
            };
            $httpBackend.flush();
            $scope.namespace = {prefix: 'prefix2', namespace: 'newNamespace'};
            var saveNamespace = {};
            $scope.saveNamespace = function (prefix, namespace) {
                saveNamespace = {prefix: prefix, namespace: namespace};
            };
            $scope.addNamespace();
            modalInstance.close();
            expect(saveNamespace).toEqual({prefix: 'prefix2', namespace: 'newNamespace'});
            expect($scope.namespace).toEqual({prefix: '', namespace: ''});
        });
    });

    describe('editPrefix', () => {
        it('should edit prefix', () => {
            $scope.loader = undefined;
            spyOn($scope, 'getNamespaces').and.callThrough();
            $httpBackend.when('POST', 'rest/repositories/activeRepository/prefix?location=').respond(200);

            $scope.editPrefix();
            $httpBackend.flush();

            expect($scope.loader).toEqual(false);
            expect($scope.getNamespaces).toHaveBeenCalled();
        });

        it('should show notification when edit prefix fails', () => {
            $scope.loader = undefined;
            spyOn(toastr, 'error');
            spyOn($scope, 'getNamespaces').and.callThrough();
            $httpBackend.when('POST', 'rest/repositories/activeRepository/prefix?location=').respond(500, {
                message: 'Edit prefix error!'
            });

            $scope.editPrefix();
            $httpBackend.flush();

            expect(toastr.error).toHaveBeenCalledWith('Edit prefix error!', 'Error');
            expect($scope.loader).toEqual(false);
        });
    });

    describe('$scope.removeNamespace()', function () {
        it('should call $scope.getNamespaces() on success', function () {
            var getNamespaces = false;
            $scope.getNamespaces = function () {
                getNamespaces = true;
            };
            $scope.removeNamespace('namespace');
            $httpBackend.flush();
            expect(getNamespaces).toBeTruthy();
        });
    });
});
