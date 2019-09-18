import "angular/repositories/services";

beforeEach(angular.mock.module('graphdb.framework.repositories.services', function ($provide) {
    $provide.constant("productInfo", {
        "productType": "standard", "productVersion": "7.0", "sesame": "2.9.0", "connectors": "5.0.0"
    });
}));

describe('==> Repository module services tests', function () {

    describe('=> $repositories tests', function () {

        var $repositories, $httpBackend, $http, $jwtAuth, httpGetActiveLocation, httpGetRepositories, httpSecurity, httpDefaultUser;

        beforeEach(angular.mock.inject(function (_$repositories_, _$httpBackend_, _$http_, _$jwtAuth_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $repositories = _$repositories_;
            $httpBackend = _$httpBackend_;
            $http = _$http_;
            $jwtAuth = _$jwtAuth_;

            $jwtAuth.canReadRepo = function () {
                return true;
            };

            httpGetActiveLocation = $httpBackend.when('GET', 'rest/locations/active').respond(200, {
                "uri": "C:\\temp\\ee\\test",
                "username": "",
                "password": "",
                "active": true,
                "local": true,
                "errorMsg": null
            });
            httpGetRepositories = $httpBackend.when('GET', 'rest/repositories').respond(200,
                [{
                    "id": "SYSTEM",
                    "title": "System configuration repository",
                    "uri": "http://localhost:8080/graphdb-workbench/repositories/SYSTEM",
                    "type": "system", "sesameType": "openrdf:SystemRepository",
                    "location": "C:\\temp\\ee\\test",
                    "readable": true,
                    "writable": true,
                    "local": true
                }, {
                    "id": "abcd",
                    "title": "",
                    "uri": "http://localhost:8080/graphdb-workbench/repositories/abcd",
                    "type": "worker",
                    "sesameType": "owlim:ReplicationClusterWorker",
                    "location": "C:\\temp\\ee\\test",
                    "readable": true,
                    "writable": true,
                    "local": true
                }]
            );
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

        describe('$repositories.init tests', function () {
            it('should not set activeRepository when there is no active location', function () {
                //If there is no active location
                httpGetActiveLocation.respond(200, {});
                $httpBackend.expectGET('rest/security/all');
                $httpBackend.expectGET('rest/locations/active');
                $repositories.init();
                $httpBackend.flush();
                expect($repositories.repositories).toEqual([]);
                expect($repositories.repository).toEqual(undefined);
                expect($repositories.location).toEqual('');
                expect($repositories.locations).toEqual([]);
                expect($repositories.getActiveLocation()).toEqual('');
                expect($repositories.hasActiveLocation()).toEqual(false);
                expect($repositories.getActiveRepository()).toEqual(undefined);
                expect($repositories.getRepositories()).toEqual([]);


            });

            it('should set activeRepository when there is active location', function () {
                //If there is active location and no active repository

                $httpBackend.expectGET('rest/security/all');
                $httpBackend.expectGET('rest/locations/active');
                $httpBackend.expectGET('rest/repositories');
                $repositories.init();
                $httpBackend.flush();
                expect($repositories.repositories).toEqual([{
                    "id": "SYSTEM",
                    "title": "System configuration repository",
                    "uri": "http://localhost:8080/graphdb-workbench/repositories/SYSTEM",
                    "type": "system", "sesameType": "openrdf:SystemRepository",
                    "location": "C:\\temp\\ee\\test",
                    "readable": true,
                    "writable": true,
                    "local": true
                }, {
                    "id": "abcd",
                    "title": "",
                    "uri": "http://localhost:8080/graphdb-workbench/repositories/abcd",
                    "type": "worker",
                    "sesameType": "owlim:ReplicationClusterWorker",
                    "location": "C:\\temp\\ee\\test",
                    "readable": true,
                    "writable": true,
                    "local": true
                }]);
                expect($repositories.repository).toEqual('');
                expect($repositories.location).toEqual({
                    "uri": "C:\\temp\\ee\\test",
                    "username": "",
                    "password": "",
                    "active": true,
                    "local": true,
                    "errorMsg": null
                });
                expect($repositories.getActiveLocation()).toEqual({
                    "uri": "C:\\temp\\ee\\test",
                    "username": "",
                    "password": "",
                    "active": true,
                    "local": true,
                    "errorMsg": null
                });
                expect($repositories.hasActiveLocation()).toEqual(true);
                expect($repositories.getActiveRepository()).toEqual('');
                expect($repositories.getRepositories()).toEqual([{
                    "id": "SYSTEM",
                    "title": "System configuration repository",
                    "uri": "http://localhost:8080/graphdb-workbench/repositories/SYSTEM",
                    "type": "system", "sesameType": "openrdf:SystemRepository",
                    "location": "C:\\temp\\ee\\test",
                    "readable": true,
                    "writable": true,
                    "local": true
                }, {
                    "id": "abcd",
                    "title": "",
                    "uri": "http://localhost:8080/graphdb-workbench/repositories/abcd",
                    "type": "worker",
                    "sesameType": "owlim:ReplicationClusterWorker",
                    "location": "C:\\temp\\ee\\test",
                    "readable": true,
                    "writable": true,
                    "local": true
                }]);
            })
        });


        it('$repositories.setRepository should set repository', function () {
            $httpBackend.flush();

            $repositories.setRepository('');
            expect($repositories.repository).toEqual('');
            expect($http.defaults.headers.common['X-GraphDB-Repository']).toEqual('');

            $repositories.setRepository(undefined);
            expect($repositories.repository).toEqual(undefined);
            expect($http.defaults.headers.common['X-GraphDB-Repository']).toEqual(undefined);

            $repositories.setRepository('test');
            expect($repositories.repository).toEqual('test');
            expect($http.defaults.headers.common['X-GraphDB-Repository']).toEqual('test');

        });

        describe('$repositories.deleteLocation', function () {

            it('should delete active location', function () {
                //we use the same location as the active one
                var uri = "C:\\temp\\ee\\test",
                    escapedUri = encodeURIComponent(uri);

                $httpBackend.expectGET('rest/security/all');
                $httpBackend.expectGET('rest/locations/active');
                $httpBackend.expectGET('rest/repositories');
                $repositories.init();
                $httpBackend.flush();

                $httpBackend.expectDELETE('rest/locations?uri=' + escapedUri).respond(200, '');

                //override init() so we can see if the function clear the var location
                $repositories.init = function () {
                    return
                };
                $repositories.deleteLocation(uri);
                $httpBackend.flush();
                expect($repositories.location).toEqual('');
                expect($repositories.getActiveLocation()).toEqual('');

            });

            it('should delete location', function () {
                var uri = "C:\\temp\\ee\\differentLocation",
                    escapedUri = encodeURIComponent(uri);

                $httpBackend.expectGET('rest/security/all');
                $httpBackend.expectGET('rest/locations/active');
                $httpBackend.expectGET('rest/repositories');
                $repositories.init();
                $httpBackend.flush();

                $httpBackend.expectDELETE('rest/locations?uri=' + escapedUri).respond(200, '');
                //override init() so we can see if the function clear the var location
                $repositories.init = function () {
                    return
                };
                $repositories.deleteLocation(uri);
                $httpBackend.flush();
                expect($repositories.location).toEqual({
                    "uri": "C:\\temp\\ee\\test",
                    "username": "",
                    "password": "",
                    "active": true,
                    "local": true,
                    "errorMsg": null
                });
                expect($repositories.getActiveLocation()).toEqual({
                    "uri": "C:\\temp\\ee\\test",
                    "username": "",
                    "password": "",
                    "active": true,
                    "local": true,
                    "errorMsg": null
                });
            })
        });

        describe('$repositories.deleteRepository', function () {
            it('should clear activeRepository if repository is the same as active one', function () {
                var respository = 'test';
                $repositories.repository = respository;
                $httpBackend.expectDELETE('rest/repositories/' + respository).respond(200, '');
                //override init() so we can see if the function clear the var repository
                $repositories.init = function () {
                    return
                };
                $repositories.deleteRepository(respository);
                $httpBackend.flush();
                expect($repositories.repository).toEqual('');
                expect($repositories.getActiveRepository()).toEqual('');
            });

            it('should not clear activeRepository if repository is different that the active one', function () {
                var respository = 'test';
                $repositories.repository = 'activeRepository';
                $httpBackend.expectDELETE('rest/repositories/' + respository).respond(200, '');
                //override init() so we can see if the function clear the var repository
                $repositories.init = function () {
                    return
                };
                $repositories.deleteRepository(respository);
                $httpBackend.flush();
                expect($repositories.repository).toEqual('activeRepository');
                expect($repositories.getActiveRepository()).toEqual('activeRepository');
            })
        })
    });
});
