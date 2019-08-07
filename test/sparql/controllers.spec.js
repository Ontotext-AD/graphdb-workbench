import "angular/core/services";
import "angular/security/services";
import "angular/repositories/services";
import "angular/namespaces/controllers";


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
        httpGetNamespaces,
        modalInstance;

    beforeEach(angular.mock.inject(function (_$httpBackend_, _$repositories_, _$location_, _$controller_, _$window_, _$timeout_, $rootScope, $q) {

        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        $timeout = _$timeout_;
        $repositories = _$repositories_;

        function FakeModal() {
            this.resultDeferred = $q.defer();
            this.result = this.resultDeferred.promise;
        }

        FakeModal.prototype.open = function (options) {
            return this;
        };

        FakeModal.prototype.close = function (item) {
            this.resultDeferred.resolve(item);
            $rootScope.$apply(); // Propagate promise resolution to 'then' functions using $apply().
        };

        modalInstance = new FakeModal();

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


        $scope = $rootScope.$new();

        $repositories.getActiveRepository = function () {
            return 'activeRepository';
        }

        var controller = $controller('NamespacesCtrl', {
            $scope: $scope,
            $modal: modalInstance,
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
            }
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
            }
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
            }
            $scope.addNamespace();
            modalInstance.close();
            expect(saveNamespace).toEqual({prefix: 'prefix2', namespace: 'newNamespace'});
            expect($scope.namespace).toEqual({});
        });
    });
    describe('$scope.removeNamespace()', function () {
        it('should call $scope.getNamespaces() on success', function () {
            var getNamespaces = false;
            $scope.getNamespaces = function () {
                getNamespaces = true;
            }
            $scope.removeNamespace('namespace');
            $httpBackend.flush();
            expect(getNamespaces).toBeTruthy();
        });
    });
});
