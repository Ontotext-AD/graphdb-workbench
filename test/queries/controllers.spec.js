import "angular/core/services";
import "angular/queries/controllers";

beforeEach(angular.mock.module('graphdb.framework.jmx.queries.controllers', function ($provide) {
    $provide.constant("productInfo", {
        "productType": "standard", "productVersion": "7.0", "sesame": "2.9.0", "connectors": "5.0.0"
    });
}));

describe('=> QueriesCtrl tests', function () {
    var $httpBackend,
        $controller,
        $timeout,
        $interval,
        $scope,
        $repositories,
        httpGetQueriesData,
        modalInstance;

    beforeEach(angular.mock.inject(function (_$httpBackend_, _$location_, _$controller_, _$window_, _$timeout_, _$interval_, _$repositories_, $rootScope, $q) {

        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        $timeout = _$timeout_;
        $interval = _$interval_;
        $repositories = _$repositories_;

        $repositories.getActiveRepository = function () {
            return 'activeRepository';
        }

        // Should mock this method, because of special implementation in repositories.service.js
        $repositories.isActiveRepoOntopType = function () {
            return false;
        }

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
        FakeModal.prototype.dismiss = function (item) {
            this.resultDeferred.reject(item);
            $rootScope.$apply(); // Propagate promise resolution to 'then' functions using $apply().
        };

        modalInstance = new FakeModal();

        $httpBackend.when('GET', 'rest/locations', {}).respond(200);

        httpGetQueriesData = $httpBackend.when('GET', 'rest/monitor/repository/activeRepository/query/active').respond(200, [{
            "trackAlias": "query-editor-37833.700000047684-1674459747948",
            "username": "admin",
            "node": null,
            "type": "QUERY",
            "numberOfOperations": 0,
            "humanLifetime": "0s",

            "sparqlString": "SELECT ?s ?p ?o\nWHERE {\n\t?s ?p ?o .\n} LIMIT 100567123123123",
            "trackId": "21107",
            "nsTotalSpentInNext": 6406320151,
            "nsAverageForOneNext": 5616,
            "state": "IN_NEXT",
            "nNext": 1140546,
            "msLifetime": 6689,
            "isRequestedToStop": false,
            "msSinceCreated": 6689,
            "running": true
        }, {
            "trackAlias": "query-editor-37833.700000047684-1674454747948",
            "username": "admin",
            "type": "QUERY",
            "numberOfOperations": 0,
            "humanLifetime": "0s",

            "sparqlString": "SELECT ?s ?p ?o\nWHERE {\n\t?s ?p ?o .\n} LIMIT 123",
            "trackId": "1234",
            "node": "http://example.com:7300/repositories/repo#678",
            "nsTotalSpentInNext": 1234567,
            "nsAverageForOneNext": 1234,
            "state": "IN_HAS_NEXT",
            "nNext": 12345,
            "msLifetime": 123,
            "isRequestedToStop": false,
            "msSinceCreated": 12345678,
            "running": true
        }]);

        $httpBackend.when('GET', 'rest/security/all').respond(200, {
            enabled: false,
            freeAcesss: {enabled: false},
            overrideAuth: {enabled: false}
        });
        $httpBackend.when('GET', 'rest/locations/active').respond(200, {locationUri: ''});
        $httpBackend.when('GET', 'rest/security/users/admin').respond(200, {
            username: 'admin',
            appSettings: {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true},
            authorities: ['ROLE_ADMIN']
        });

        $scope = $rootScope.$new();
        var controller = $controller('QueriesCtrl', {
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

    describe('$scope.getQueries()', function () {
        it('should set queries correctly', function () {
            $httpBackend.expectGET('rest/monitor/repository/activeRepository/query/active');
            $interval.flush(1001);
            $httpBackend.flush();
            expect($scope.queries).toEqual({
                "21107": {
                    "trackAlias": "query-editor-37833.700000047684-1674459747948",
                    "username": "admin",
                    "node": null,
                    "type": "QUERY",
                    "numberOfOperations": 0,
                    "humanLifetime": "0s",
                    "sparqlString": "SELECT ?s ?p ?o\nWHERE {\n\t?s ?p ?o .\n} LIMIT 100567123123123",
                    "trackId": "21107",
                    "parsedNode": null,
                    "nsTotalSpentInNext": 6406320151,
                    "nsAverageForOneNext": 5616,
                    "state": "IN_NEXT",
                    "nNext": 1140546,
                    "msLifetime": 6689,
                    "isRequestedToStop": false,
                    "msSinceCreated": 6689,
                    "running": true
                },
                "1234": {
                    "trackAlias": "query-editor-37833.700000047684-1674454747948",
                    "username": "admin",
                    "type": "QUERY",
                    "numberOfOperations": 0,
                    "humanLifetime": "0s",
                    "sparqlString": "SELECT ?s ?p ?o\nWHERE {\n\t?s ?p ?o .\n} LIMIT 123",
                    "trackId": "1234",
                    "node": "http://example.com:7300/repositories/repo#678",
                    "parsedNode": ["678", "example:7300", "repo"],
                    "nsTotalSpentInNext": 1234567,
                    "nsAverageForOneNext": 1234,
                    "state": "IN_HAS_NEXT",
                    "nNext": 12345,
                    "msLifetime": 123,
                    "isRequestedToStop": false,
                    "msSinceCreated": 12345678,
                    "running": true
                }
            })
            expect($scope.error).toEqual('')
            expect($scope.noQueries).toBeFalsy();
        })

        it('should set noQueries correct', function () {
            $httpBackend.expectGET('rest/monitor/repository/activeRepository/query/active');
            httpGetQueriesData.respond(200, []);
            $interval.flush(1001);
            $httpBackend.flush();
            expect($scope.queries).toEqual({})
            expect($scope.error).toEqual('')
            expect($scope.noQueries).toBeTruthy();
        })

        it('should set error', function () {
            $scope.error = ''
            $httpBackend.expectGET('rest/monitor/repository/activeRepository/query/active');
            httpGetQueriesData.respond(400, '');
            $interval.flush(1001);
            $httpBackend.flush();
            expect($scope.error).toBeTruthy();

            $interval.flush(1001);
            $httpBackend.verifyNoOutstandingRequest();
            expect($scope.error).toBeTruthy();
        })
    })

    describe('$scope.abortQuery()', function () {
        it('should open modal and do nothing on modal.dismiss', function () {
            $httpBackend.flush();
            $scope.abortQuery();
            modalInstance.dismiss();
            expect($httpBackend.flush).toThrow();
        })
        it('should open modal and call $scope.deleteQueryHttp() on modal.close', function () {
            $httpBackend.flush();
            var deleteQueryHttp = '';
            $scope.deleteQueryHttp = function (id) {
                deleteQueryHttp = id;
            }
            $scope.abortQuery('id');
            modalInstance.close();
            expect(deleteQueryHttp).toEqual('id');
        })
    })

});
