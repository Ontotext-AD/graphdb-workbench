import 'angular/core/services/repositories.service';

beforeEach(angular.mock.module('graphdb.framework.core.services.repositories', function ($provide) {
    $provide.constant("productInfo", {
        "productType": "standard", "productVersion": "7.0", "sesame": "2.9.0", "connectors": "5.0.0"
    });
}));

describe('==> Repository module services tests', function () {

    describe('=> $repositories tests', function () {

        let $repositories, $httpBackend, $http, $jwtAuth, httpGetActiveLocation, httpGetRepositories, httpSecurity, httpDefaultUser, GlobalEmitterBuss;
        let $timeout;

        beforeEach(angular.mock.inject(function (_$repositories_, _$httpBackend_, _$http_, _$jwtAuth_, _$timeout_, _GlobalEmitterBuss_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $repositories = _$repositories_;
            $httpBackend = _$httpBackend_;
            $http = _$http_;
            $jwtAuth = _$jwtAuth_;
            $timeout = _$timeout_;
            GlobalEmitterBuss = _GlobalEmitterBuss_;

            $jwtAuth.canReadRepo = function () {
                return true;
            };

            GlobalEmitterBuss.emit = (eventName, eventData, callback) => {
                if ('repositoryWillChangeEvent' === eventName) {
                    callback(eventData);
                }
            };


            httpGetActiveLocation = $httpBackend.when('GET', 'rest/locations/active').respond(200, {
                "uri": "C:\\temp\\ee\\test",
                "username": "",
                "password": "",
                "active": true,
                "local": true,
                "errorMsg": null
            });
            httpGetRepositories = $httpBackend.when('GET', 'rest/repositories/all').respond(200, { 'C:\\temp\\ee\\test':
                new Object([{
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
                }])});
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
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        describe('$repositories.init tests', function () {
            it('should not set activeRepository when there is no active location', function () {
                //If there is no active location
                httpGetActiveLocation.respond(200);
                $httpBackend.expectGET('rest/security/all');
                $httpBackend.expectGET('rest/locations/active');
                $repositories.init();
                $httpBackend.flush();
                expect($repositories.repositories).toEqual(new Map());
                expect($repositories.location).toEqual('');
                expect($repositories.locations).toEqual([{ uri: '', label: 'Local', local: true, isInCluster: false }]);
                expect($repositories.getActiveLocation()).toEqual('');
                expect($repositories.hasActiveLocation()).toEqual(false);
                expect($repositories.getActiveRepository()).toBeUndefined();
                expect($repositories.getRepositories()).toEqual([]);
            });

            it('should set activeRepository when there is active location', function () {
                //If there is active location and no active repository

                $httpBackend.expectGET('rest/security/all');
                $httpBackend.expectGET('rest/locations/active');
                $httpBackend.expectGET('rest/repositories/all');
                $repositories.init();
                $httpBackend.flush();
                expect($repositories.repositories).toEqual(new Map([['C:\\temp\\ee\\test', [{
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
                }]]]));
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
                expect($repositories.getActiveRepository()).toBeUndefined();
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
            expect($repositories.getActiveRepository()).toBeUndefined();

            $repositories.setRepository(undefined);
            expect($repositories.getActiveRepository()).toBeUndefined();

            $repositories.setRepository(null);
            expect($repositories.getActiveRepository()).toBeUndefined();

            $repositories.setRepository({id: 'test', location: ''});
            expect($repositories.getActiveRepository()).toEqual('test');
        });

        describe('$repositories.deleteLocation', function () {

            it('should delete active location', function () {
                //we use the same location as the active one
                const uri = 'C:\\temp\\ee\\test';
                const escapedUri = encodeURIComponent(uri);

                $repositories.setRepository({id: 'abcd', location: 'C:\\temp\\ee\\test'})

                $httpBackend.expectGET('rest/security/all');
                $httpBackend.expectGET('rest/locations/active');
                $timeout.flush();
                $httpBackend.expectGET('rest/repositories/all');
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
                $httpBackend.expectGET('rest/repositories/all');
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
                let uri = "C:\\temp\\ee\\test";
                let repository = {id: 'test', location: uri};
                $repositories.setRepository(repository);
                $repositories.repositories.set(uri, [repository]);
                $httpBackend.expectDELETE('rest/repositories/' + repository.id + '?location=C:%5Ctemp%5Cee%5Ctest').respond(200, '');
                //override init() so we can see if the function clear the var repository
                $repositories.init = function () {
                    return
                };
                $repositories.deleteRepository(repository);
                $httpBackend.flush();
                expect($repositories.getActiveRepository()).toBeUndefined();
            });

            it('should not clear activeRepository if repository is different that the active one', function () {
                let uri = "C:\\temp\\ee\\test";
                let repository = {id: 'test', location: uri};
                $repositories.setRepository({id: 'activeRepository', location: ''});
                $repositories.repositories.set('', [$repositories.repository]);
                $httpBackend.expectDELETE('rest/repositories/' + repository.id + '?location=C:%5Ctemp%5Cee%5Ctest').respond(200, '');
                //override init() so we can see if the function clear the var repository
                $repositories.init = function () {
                    return
                };
                $repositories.deleteRepository(repository);
                $httpBackend.flush();
                expect($repositories.getActiveRepository()).toEqual('activeRepository');
            })
        })
    });
});
