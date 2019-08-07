import "angular/import/controllers";

beforeEach(angular.mock.module('graphdb.framework.impex.import.controllers', function ($provide) {
    $provide.constant("productInfo", {
        "productType": "standard", "productVersion": "7.0", "sesame": "2.9.0", "connectors": "5.0.0"
    });
}));

describe('==> Import module controllers tests', function () {
    describe('= > CommonCtrl tests', function () {
        //test setup
        var $controller,
            $httpBackend,
            $repositories,
            $scope,
            getFilesListHttp;

        beforeEach(angular.mock.inject(function (_$controller_, _$httpBackend_, $rootScope, _$repositories_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $controller = _$controller_;
            $httpBackend = _$httpBackend_;
            $repositories = _$repositories_;
            //new a $scope
            $scope = $rootScope.$new();
            var controller = $controller('CommonCtrl', {
                $scope: $scope,
                ModalService: {
                    openSimpleModal: function () {
                        return this;
                    }
                }
            });
            $scope.canWriteActiveRepo = function () {
                return true;
            };
            $scope.getBaseUrl = function () {
                return 'scope.url';
            };
            getFilesListHttp = $httpBackend.when('GET', 'scope.url').respond(200, [{
                "status": "NONE",
                "message": "",
                "name": "statements.trig",
                "type": "file"
            }])
            $httpBackend.when('GET', 'rest/info/properties').respond(200, [{
                "key": "graphdb.workbench.importDirectory",
                "value": "/graphdb-import",
                "source": "",
                "type": "file"
            }, {"key": "graphdb.workbench.maxUploadSize", "value": "209715200", "source": ""}]);
            $httpBackend.when('GET', 'rest/security/all').respond(200, {
                enabled: false,
                freeAcesss: {enabled: false},
                overrideAuth: {enabled: false}
            });
            $httpBackend.when('GET', 'rest/locations/active').respond(200, {locationUri: ''});
            $httpBackend.when('GET', 'rest/security/user/admin').respond(200, {
                username: 'admin',
                appSettings: {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true},
                authorities: ['ROLE_ADMIN']
            });

        }));

        describe('$scope.updateListHttp() tests', function () {
            it('should set $scope.files == data when $scope.files is empty || function is called with true param', function () {
                $scope.files = [];
                $scope.viewType = 'server';
                $httpBackend.flush();
                $httpBackend.expectGET('scope.url');
                $scope.url = 'scope.url';
                $scope.updateListHttp();
                $httpBackend.flush();
                expect($scope.files).toEqual([{
                    "status": "NONE",
                    "message": "",
                    "name": "statements.trig",
                    "type": "file"
                }])
                expect($scope.loader).toBeFalsy();

                $scope.files = [1];
                $scope.viewType = 'no-url';
                $scope.updateListHttp(true);
                $httpBackend.flush();
                expect($scope.files).toEqual([{
                    "status": "NONE",
                    "message": "",
                    "name": "statements.trig",
                    "type": "file"
                }])
                expect($scope.loader).toBeFalsy();
            })

            it('should change status correct', function () {
                $scope.files = [{
                    "status": "NONE",
                    "message": "",
                    "name": "statements.trig",
                    "type": "file"
                }];
                $scope.viewType = 'no-url';
                $scope.url = 'scope.url';
                $httpBackend.flush();
                getFilesListHttp.respond(200, [{
                    "status": "IMPORT",
                    "message": "",
                    "name": "statements.trig",
                    "type": "file"
                }]);
                $httpBackend.expectGET('scope.url');
                $scope.updateListHttp();
                $httpBackend.flush();
                expect($scope.files).toEqual([{
                    "status": "IMPORT",
                    "message": "",
                    "name": "statements.trig",
                    "type": "file"
                }])
                expect($scope.loader).toBeFalsy();

            });

        });

        describe('$scope.isLocalLocation', function () {
            it('should return correct value', function () {
                $httpBackend.flush();
                $repositories.getActiveLocation = function () {
                    return {uri: 'http://some.url', local: false}
                }
                expect($scope.isLocalLocation()).toBeFalsy();
                $repositories.getActiveLocation = function () {
                    return {uri: 'local.location', local: true}
                }
                expect($scope.isLocalLocation()).toBeTruthy();

            });
        });

    });
});
