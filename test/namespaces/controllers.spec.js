import "angular/core/services";
import 'angular/core/interceptors/unauthorized.interceptor';
import 'angular/core/services/jwt-auth.service';
import 'angular/core/services/repositories.service';
import "angular/namespaces/controllers";
import "angular/rest/rdf4j.repositories.rest.service";
import {FakeModal} from '../mocks';

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
        modalInstance;

    beforeEach(angular.mock.inject(function (_$httpBackend_, _$repositories_, _RDF4JRepositoriesRestService_, _toastr_, _$location_, _$controller_, _$window_, _$timeout_, $rootScope, $q) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        $timeout = _$timeout_;
        $repositories = _$repositories_;
        RDF4JRepositoriesRestService = _RDF4JRepositoriesRestService_;
        toastr = _toastr_;
        $scope = $rootScope.$new();

        modalInstance = new FakeModal($q, $rootScope);

        $httpBackend.when('GET', 'rest/security/all').respond(200, {
            enabled: false,
            freeAcesss: {enabled: false},
            overrideAuth: {enabled: false}
        });
        $httpBackend.when('GET', 'rest/locations/active').respond(200, '');
        $httpBackend.when('GET', 'rest/security/user/admin').respond(200, {
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
            }
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
        it('should call $scope.saveNamespace() if prefix exist', function () {
            $httpBackend.flush();

            $scope.namespace = {prefix: 'prefix', namespace: 'newNamespace'};
            var saveNamespace = {};
            $scope.saveNamespace = function (prefix, namespace) {
                saveNamespace = {prefix: prefix, namespace: namespace}
            };
            $scope.addNamespace();
            modalInstance.close();
            expect(saveNamespace).toEqual({prefix: 'prefix', namespace: 'newNamespace'});
            expect($scope.namespace).toEqual({});
        });

        it('should call $scope.saveNamespace() if prefix not exist', function () {
            $httpBackend.flush();
            $scope.namespace = {prefix: 'prefix2', namespace: 'newNamespace'};
            var saveNamespace = {};
            $scope.saveNamespace = function (prefix, namespace) {
                saveNamespace = {prefix: prefix, namespace: namespace}
            };
            $scope.addNamespace();
            modalInstance.close();
            expect(saveNamespace).toEqual({prefix: 'prefix2', namespace: 'newNamespace'});
            expect($scope.namespace).toEqual({});
        });
    });

    describe('editPrefix', () => {
        it('should edit prefix', () => {
            $scope.loader = undefined;
            spyOn($scope, 'getNamespaces').and.callThrough();
            $httpBackend.when('POST', 'rest/repositories/activeRepository/prefix').respond(200);

            $scope.editPrefix();
            $httpBackend.flush();

            expect($scope.loader).toEqual(false);
            expect($scope.getNamespaces).toHaveBeenCalled();
        });

        it('should show notification when edit prefix fails', () => {
            $scope.loader = undefined;
            spyOn(toastr, 'error');
            spyOn($scope, 'getNamespaces').and.callThrough();
            $httpBackend.when('POST', 'rest/repositories/activeRepository/prefix').respond(500, {
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
