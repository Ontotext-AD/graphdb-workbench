import "angular/security/services";

beforeEach(angular.mock.module('graphdb.framework.security.services', function($provide) {
    $provide.constant("productInfo", {
        "productType": "standard", "productVersion": "7.0", "sesame": "2.9.0", "connectors": "5.0.0"
    });
}));

describe('$jwtAuth tests', function () {

    var $jwtAuth, $httpBackend, $rootScope, $location, httpSecurity, httpGetAdmin;

    beforeEach(angular.mock.inject(function (_$jwtAuth_, _$httpBackend_, _$rootScope_, _$location_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $jwtAuth = _$jwtAuth_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $location = _$location_;

        httpSecurity = $httpBackend.when('GET', 'rest/security/all').respond(200, {
            enabled: true,
            freeAccess: {enabled: false},
            overrideAuth: {enabled: false}
        });
        httpGetAdmin = $httpBackend.when('GET', 'rest/security/user/admin').respond(200, {
            username: 'admin',
            appSettings: {},
            grantedAuthorities: []
        });

        /*
        //requests that starts from repository/services.js after the security is OK
        httpGetActiveLocation = $httpBackend.when('GET', 'rest/locations/active').respond(200, {
            "uri": "C:\\temp\\ee\\test",
            "username":"",
            "password":"",
            "superadminSecret":null,
            "active":true,
            "local":true,
            "errorMsg":null
        });
        httpGetRepositories = $httpBackend.when('GET', 'rest/repositories').respond(200,
            [{
                "id":"SYSTEM",
                "title":"System configuration repository",
                "uri":"http://localhost:8080/graphdb-workbench/repositories/SYSTEM",
                "type":"system","sesameType":"openrdf:SystemRepository",
                "location":"C:\\temp\\ee\\test",
                "readable":true,
                "writable":true,
                "local":true
            },{
                "id":"abcd",
                "title":"",
                "uri":"http://localhost:8080/graphdb-workbench/repositories/abcd",
                "type":"worker",
                "sesameType":"owlim:ReplicationClusterWorker",
                "location":"C:\\temp\\ee\\test",
                "readable":true,
                "writable":true,
                "local":true
            }]
        );
        */

    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('$jwtAuth tests', function () {
        it('should set securityEnabled and freeAccess OFF correct', function () {
            $httpBackend.expectGET('rest/security/all');
            $httpBackend.flush();
            expect($jwtAuth.isSecurityEnabled()).toEqual(true);
            expect($jwtAuth.isFreeAccessEnabled()).toEqual(false);
        });

        it('should set securityEnabled and freeAccess ON correct', function () {
            httpSecurity.respond(200, {
                enabled: true,
                freeAccess: {enabled: true, authorities: []},
                overrideAuth: {enabled: false}
            });
            $httpBackend.expectGET('rest/security/all');
            $httpBackend.flush();
            expect($jwtAuth.isSecurityEnabled()).toEqual(true);
            expect($jwtAuth.isFreeAccessEnabled()).toEqual(true);
        })
    });

    it('$jwtAuth.autenticate should set securityEnabled to true', function () {

        $httpBackend.expectGET('rest/security/all');
        $httpBackend.flush();

        $jwtAuth.authenticate({
            username: "admin",
            password: "admin",
            expiration: 1440836388778,
            nonLocked: true,
            enabled: true,
            authorities: ["ROLE_ADMIN"]
        }, function () {
            return "1234"
        });

        expect($jwtAuth.securityEnabled).toEqual(true);
        expect($jwtAuth.auth).toBeDefined();
    });

    it('$jwtAuth.clearAuthentication should set auth to undefined', function () {

        $httpBackend.flush();
        $jwtAuth.clearAuthentication();

        expect($jwtAuth.securityEnabled).toEqual(true);
        expect($jwtAuth.auth).toBeUndefined();
        // freeAccessPrincipal is either undefined or the principal for free access if that's enabled
        expect($jwtAuth.principal).toEqual($jwtAuth.freeAccessPrincipal)
    });

    describe('$jwtAuth.toggleSecurity', function () {
        it('should change securityEnabled to false', function () {
            httpSecurity.respond(200, {
                enabled: false,
                freeAccess: {enabled: false},
                overrideAuth: {enabled: false}
            });
            $httpBackend.flush();
            $httpBackend.expectPOST('rest/security', "false").respond(200, '')
            $jwtAuth.securityEnabled = true;
            $jwtAuth.toggleSecurity(false);
            $httpBackend.flush();

            expect($jwtAuth.securityEnabled).toEqual(false);
            expect($jwtAuth.isSecurityEnabled()).toEqual(false);
        });

        it('should change securityEnabled to true', function () {
            $httpBackend.flush();
            $httpBackend.expectPOST('rest/security', "true").respond(200, '')
            $jwtAuth.securityEnabled = false;
            $jwtAuth.toggleSecurity(true);
            $httpBackend.flush();

            expect($jwtAuth.securityEnabled).toEqual(true);
            expect($jwtAuth.isSecurityEnabled()).toEqual(true);
        })
        it('should not change securityEnabled', function () {
            $httpBackend.flush();
            $jwtAuth.securityEnabled = true;
            $jwtAuth.toggleSecurity(true);

            expect($jwtAuth.securityEnabled).toEqual(true);
            expect($jwtAuth.isSecurityEnabled()).toEqual(true);
            $jwtAuth.securityEnabled = false;
            $jwtAuth.toggleSecurity(false);

            expect($jwtAuth.securityEnabled).toEqual(false);
            expect($jwtAuth.isSecurityEnabled()).toEqual(false);
        })
    })

    describe('$jwtAuth.toggleFreeAccess', function () {
        it('should change securityEnabled to false', function () {
            $httpBackend.flush();
            $httpBackend.expectPOST('rest/security/freeaccess', {enabled: "false"}).respond(200, '')
            $jwtAuth.freeAccess = true;
            $jwtAuth.toggleFreeAccess(false);
            $httpBackend.flush();

            expect($jwtAuth.freeAccess).toEqual(false);
            expect($jwtAuth.isFreeAccessEnabled()).toEqual(false);
        })
        it('should change securityEnabled to true', function () {
            $httpBackend.flush();
            $httpBackend.expectPOST('rest/security/freeaccess', {enabled: "true"}).respond(200, '')
            $jwtAuth.freeAccess = false;
            $jwtAuth.toggleFreeAccess(true);
            $httpBackend.flush();

            expect($jwtAuth.freeAccess).toEqual(true);
            expect($jwtAuth.isFreeAccessEnabled()).toEqual(true);
        })
        it('should not change securityEnabled', function () {
            $httpBackend.flush();
            $jwtAuth.freeAccess = true;
            $jwtAuth.toggleFreeAccess(true);

            expect($jwtAuth.freeAccess).toEqual(true);
            expect($jwtAuth.isFreeAccessEnabled()).toEqual(true);
            $jwtAuth.freeAccess = false;
            $jwtAuth.toggleFreeAccess(false);

            expect($jwtAuth.freeAccess).toEqual(false);
            expect($jwtAuth.isFreeAccessEnabled()).toEqual(false);
        })
    })

    describe('$jwtAuth.hasRole', function () {
        it('return correct value when freeAccess is false', function () {
            $httpBackend.flush();
            $jwtAuth.principal = [];
            $jwtAuth.freeAccess = false;
            $jwtAuth.principal = undefined;

            $jwtAuth.securityEnabled = false;
            expect($jwtAuth.hasRole('ROLE_USER')).toEqual(true);
            expect($jwtAuth.hasRole('ROLE_ADMIN')).toEqual(true);
            expect($jwtAuth.hasRole('IS_AUTHENTICATED_FULLY')).toEqual(true);
            expect($jwtAuth.hasRole('ROLE_ANY')).toEqual(true);

            $jwtAuth.securityEnabled = true;
            expect($jwtAuth.hasRole('ROLE_USER')).toEqual(false);
            expect($jwtAuth.hasRole('ROLE_ADMIN')).toEqual(false);
            expect($jwtAuth.hasRole('IS_AUTHENTICATED_FULLY')).toEqual(false);

            $jwtAuth.principal = {authorities: ['ROLE_USER']};
            expect($jwtAuth.hasRole('ROLE_ADMIN')).toEqual(false);
            expect($jwtAuth.hasRole('ROLE_USER')).toEqual(true);
            expect($jwtAuth.hasRole('IS_AUTHENTICATED_FULLY')).toEqual(true);

            $jwtAuth.principal = {authorities: ['ROLE_ADMIN']};
            expect($jwtAuth.hasRole('ROLE_ADMIN')).toEqual(true);
            expect($jwtAuth.hasRole('ROLE_USER')).toEqual(false);
            expect($jwtAuth.hasRole('IS_AUTHENTICATED_FULLY')).toEqual(true);

            $jwtAuth.principal = {authorities: ['ROLE_USER', 'ROLE_ADMIN']};
            expect($jwtAuth.hasRole('ROLE_ADMIN')).toEqual(true);
            expect($jwtAuth.hasRole('ROLE_USER')).toEqual(true);
            expect($jwtAuth.hasRole('IS_AUTHENTICATED_FULLY')).toEqual(true);

            $jwtAuth.principal = {authorities: []};
            expect($jwtAuth.hasRole('ROLE_ADMIN')).toEqual(false);
            expect($jwtAuth.hasRole('ROLE_USER')).toEqual(false);
            expect($jwtAuth.hasRole('IS_AUTHENTICATED_FULLY')).toEqual(true);

        });
    });

    describe('$jwtAuth.checkRights', function () {
        it('return correct value', function () {
            $httpBackend.flush();
            var location = {uri: 'otherLocation'};
            $jwtAuth.principal = {
                authorities: [
                    'WRITE_REPO_someRepo',
                    'READ_REPO_someRepo',
                    'READ_REPO_OtherRepo',
                    'WRITE_REPO_someOtherRepo',
                    "READ_REPO_workertest"]
            }
            expect($jwtAuth.checkRights()).toEqual(false);

            expect($jwtAuth.checkRights(location, 'someRepo', 'READ')).toEqual(true);
            expect($jwtAuth.checkRights(location, 'someRepo', 'WRITE')).toEqual(true);
            expect($jwtAuth.checkRights(location, 'OtherRepo', 'READ')).toEqual(true);
            expect($jwtAuth.checkRights(location, 'OtherRepo', 'WRITE')).toEqual(false);

            location = {uri: 'http://darwin:27040'}
            expect($jwtAuth.checkRights(location, 'workertest', 'READ')).toEqual(true);

            location = {uri: 'location'}
            expect($jwtAuth.checkRights(location, 'someRepo', 'READ')).toEqual(true);
            expect($jwtAuth.checkRights(location, 'someRepo', 'WRITE')).toEqual(true);

        });
    });

    describe('$jwtAuth.canReadRepo', function () {
        it('return correct value', function () {
            $httpBackend.flush();
            var location = {uri: 'someLocation'};
            expect($jwtAuth.canReadRepo(undefined, 'someRepo')).toEqual(false);

            $jwtAuth.securityEnabled = false;
            $jwtAuth.freeAccess = true;
            expect($jwtAuth.canReadRepo(location, 'someRepo')).toEqual(true);

            $jwtAuth.securityEnabled = false;
            $jwtAuth.freeAccess = false;
            expect($jwtAuth.canReadRepo(location, 'someRepo')).toEqual(true);

            //NOTE:
            //Is it that OK as a case ?!? Or we need to have some statements
            // that check free access user for rights for that REPO
            //FIXME  when free access is true a default principal is inserted.
            $jwtAuth.securityEnabled = true;
            $jwtAuth.freeAccess = true;
            //expect($jwtAuth.canReadRepo(location, 'someRepo')).toEqual(true);

            $jwtAuth.securityEnabled = true;
            $jwtAuth.freeAccess = false;
            expect($jwtAuth.canReadRepo(location, 'someRepo')).toEqual(false);

            $jwtAuth.principal = '';
            expect($jwtAuth.canReadRepo(location, 'someRepo')).toEqual(false);


            $jwtAuth.principal = 'is defined';
            $jwtAuth.hasRole = function () {
                return true;
            }
            expect($jwtAuth.canReadRepo('someLocation', 'someRepo')).toEqual(true);

            $jwtAuth.hasRole = function () {
                return false;
            }
            $jwtAuth.checkRights = function () {
                return true;
            }
            expect($jwtAuth.canReadRepo('someLocation', 'someRepo')).toEqual(true);
            $jwtAuth.checkRights = function () {
                return false;
            }
            expect($jwtAuth.canReadRepo('someLocation', 'someRepo')).toEqual(false);
        });
    });

    describe('$jwtAuth.canWriteRepo', function () {
        it('return correct value', function () {
            $httpBackend.flush();

            var location = {uri: 'someLocation'};
            expect($jwtAuth.canWriteRepo()).toEqual(false);

            $jwtAuth.securityEnabled = false;
            $jwtAuth.freeAccess = false;
            expect($jwtAuth.canWriteRepo(location, 'someRepo')).toEqual(true);

            $jwtAuth.securityEnabled = false;
            $jwtAuth.freeAccess = true;
            expect($jwtAuth.canWriteRepo(location, 'someRepo')).toEqual(true);

            $jwtAuth.securityEnabled = true;
            $jwtAuth.freeAccess = false;
            $jwtAuth.principal = [];
            expect($jwtAuth.canWriteRepo(location, 'someRepo')).toEqual(false);


            $jwtAuth.principal = {authorities: ['ROLE_ADMIN']};
            expect($jwtAuth.canWriteRepo(location, 'someRepo')).toEqual(true);

            $jwtAuth.principal = {authorities: []};
            $jwtAuth.checkRights = function () {
                return true
            }
            expect($jwtAuth.canWriteRepo(location, 'someRepo')).toEqual(true);
            $jwtAuth.checkRights = function () {
                return false
            }
            expect($jwtAuth.canWriteRepo(location, 'someRepo')).toEqual(false);


        });
    });

    describe('$rootScope.setPermissionDenied', function () {
        it('return correct value', function () {
            $httpBackend.flush();

            $jwtAuth.securityEnabled = false;
            expect($rootScope.setPermissionDenied('/')).toEqual(false);
            expect($rootScope.setPermissionDenied('/login')).toEqual(false);
            expect($rootScope.setPermissionDenied('/differentUrl')).toEqual(true);

            $jwtAuth.securityEnabled = true;
            expect($rootScope.setPermissionDenied('/')).toEqual(false);
            expect($rootScope.setPermissionDenied('/login')).toEqual(false);
            expect($rootScope.setPermissionDenied('/differentUrl')).toEqual(false);

            $jwtAuth.auth = {};
            expect($rootScope.setPermissionDenied('/')).toEqual(false);
            expect($rootScope.setPermissionDenied('/login')).toEqual(false);
            expect($rootScope.setPermissionDenied('/differentUrl')).toEqual(true);
            expect($rootScope.deniedPermissions['/differentUrl']).toEqual(true);
        })
    });
    describe('$rootScope.hasPermission', function () {
        it('return correct value', function () {
            $httpBackend.flush();

            $rootScope.deniedPermissions = {'/someUrl': true}

            $location.path = function () {
                return '/someUrl'
            }
            expect($rootScope.hasPermission()).toEqual(false);

            $location.path = function () {
                return '/otherUrl'
            }
            expect($rootScope.hasPermission()).toEqual(true);
        })
    });
});
