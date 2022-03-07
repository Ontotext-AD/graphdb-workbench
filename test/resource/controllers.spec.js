beforeEach(angular.mock.module('graphdb.framework.explore.controllers'));

describe('=> ExploreCtrl tests', function () {
    var $repositories,
        ClassInstanceDetailsService,
        $httpBackend,
        $location,
        $controller,
        $timeout,
        $window,
        $scope,
        $jwtAuth;

    beforeEach(angular.mock.inject(function (_$repositories_, _ClassInstanceDetailsService_, _$httpBackend_, _$location_, _$controller_, _$window_, _$timeout_, $rootScope, _$jwtAuth_) {
        $repositories = _$repositories_;
        ClassInstanceDetailsService = _ClassInstanceDetailsService_;
        $httpBackend = _$httpBackend_;
        $location = _$location_;
        $controller = _$controller_;
        $window = _$window_;
        $timeout = _$timeout_;
        $jwtAuth = _$jwtAuth_;

        $scope = $rootScope.$new();

        $jwtAuth.getPrincipal = function () {
            return {
                username: "user",
                password: "",
                confirmpassword: "",
                authorities: ['ROLE_USER', 'WRITE_REPO_myrepo', 'READ_REPO_myrepo'],
                appSettings: {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true}
            }
        }

        $controller('ExploreCtrl', {$scope: $scope, $jwtAuth: $jwtAuth});

        $httpBackend.when('GET', 'rest/security/all').respond(200, {
            enabled: true,
            freeAccess: {enabled: false},
            overrideAuth: {enabled: false}
        });

        $httpBackend.when('GET', 'rest/security/authenticatedUser').respond(401, 'Authentication required');
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('$scope.changeRole()', function () {
        it('should set $scope.role correct nad call $scope.exploreResource()', function () {
            $httpBackend.flush();
            $scope.role = '';
            spyOn($scope, 'exploreResource').and.callThrough();

            $scope.changeRole('someRole');

            expect($scope.role).toEqual('someRole');
            expect($scope.exploreResource).toHaveBeenCalled();
        })
    });

    describe('$scope.changeInference()', function () {
        it('should set $scope.inference correct and call $scope.exploreResource()', function () {
            $httpBackend.flush();
            $scope.inference = '';
            spyOn($scope, 'exploreResource').and.callThrough();

            $scope.changeInference('inference');

            expect($scope.inference).toEqual('inference');
            expect($scope.exploreResource).toHaveBeenCalled();
        })
    });

    describe('$scope.getLocalName()', function () {
        it('should return undefined', function () {
            $httpBackend.flush();
            expect($scope.getLocalName()).toBeUndefined();
            expect($scope.getLocalName(undefined)).toBeUndefined();
        });

        it('should return correct value', function () {
            $httpBackend.flush();
            expect($scope.getLocalName('some#test/string')).toEqual('string');
            expect($scope.getLocalName('some/test#string')).toEqual('string');
            expect($scope.getLocalName('someTest#string')).toEqual('string');
            expect($scope.getLocalName('someTest/string')).toEqual('string');
        })
    })

    describe('$scope.getRdfStarLocalNames()', function () {
        it('should return triple resources correct local names', function () {
            $httpBackend.flush();
            const triple1 = '<<<http://www.wikidata.org/entity/S1> <http://www.wikidata.org/prop/P1> <http://www.wikidata.org/entity/O1>>>'
            const triple2 = '<<<<<http://www.wikidata.org/entity/S1> <http://www.wikidata.org/prop/P1> <http://www.wikidata.org/entity/O1>>> <http://www.wikidata.org/prop/qualifier/P2> "datetime"^^<http://www.w3.org/2001/XMLSchema#xsd:dateTime>>>'
            expect($scope.getRdfStarLocalNames(triple1)).toEqual('<<<S1> <P1> <O1>>>');
            expect($scope.getRdfStarLocalNames(triple2)).toEqual('<<<<<S1> <P1> <O1>>> <P2> "datetime"^^<http://www.w3.org/2001/XMLSchema#xsd:dateTime>>>');

        });
    });


    describe('$scope.isTripleResource()', function () {
        it('should return true if triple resource', function () {
            $httpBackend.flush();
            $scope.tripleParam = '<<<S1> <P1> <O1>>>';

            expect($scope.isTripleResource()).toBeTruthy();

        });
    });
});

describe('=> EditResourceCtrl', function () {
    var $repositories,
        $httpBackend,
        $location,
        $controller,
        $timeout,
        $window,
        ClassInstanceDetailsService,
        StatementsService,
        $scope;

    beforeEach(angular.mock.inject(function (_$repositories_, _$httpBackend_, _$location_, _$controller_, _$window_, _$timeout_, _ClassInstanceDetailsService_, _StatementsService_, $rootScope) {
        $repositories = _$repositories_;
        $httpBackend = _$httpBackend_;
        $location = _$location_;
        $controller = _$controller_;
        $window = _$window_;
        $timeout = _$timeout_;
        ClassInstanceDetailsService = _ClassInstanceDetailsService_;
        StatementsService = _StatementsService_;
        $scope = $rootScope.$new();

        $controller('EditResourceCtrl', {$scope: $scope});

        $httpBackend.when('GET', 'rest/security/all').respond(200, {
            enabled: true,
            freeAccess: {enabled: false},
            overrideAuth: {enabled: false}
        });

        $httpBackend.when('GET', 'rest/security/authenticatedUser').respond(401, 'Authentication required');
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('$scope.validateUri()', function () {
        it('sould return false when there is no ":"', function () {
            $httpBackend.flush();
            expect($scope.validateUri()).toBeFalsy();
            expect($scope.validateUri('')).toBeFalsy();
            expect($scope.validateUri('noTwoDotsHere')).toBeFalsy();
        });

        // TODO: Why this breaks
        xit('should return false when there is not valid URL and no namespace', function () {
            $httpBackend.flush();
            $scope.namespaces = [];
            expect($scope.validateUri('someThing:prefix')).toBeFalsy();
            expect($scope.validateUri('someThing:prefix')).toBeFalsy();
        });

        it('should return false when is valid URL but no third "/" in it', function () {
            $httpBackend.flush();
            $scope.namespaces = [];
            expect($scope.validateUri('http://some.url')).toBeFalsy();
            expect($scope.validateUri('https://some.url')).toBeFalsy();
            expect($scope.validateUri('http://www.some.url')).toBeFalsy();
            expect($scope.validateUri('https://www.some.url')).toBeFalsy();
        });

        it('should return true when is valid URL and there is a third "/" in it', function () {
            $httpBackend.flush();
            $scope.namespaces = [];
            expect($scope.validateUri('http://some.url/prefix')).toBeTruthy();
            expect($scope.validateUri('https://some.url/prefix')).toBeTruthy();
            expect($scope.validateUri('http://www.some.url/prefix')).toBeTruthy();
            expect($scope.validateUri('https://www.some.url/prefix')).toBeTruthy();
        });

        it('should return false when prefix is in namespace but no sufix', function () {
            $httpBackend.flush();
            $scope.namespaces = [{'prefix': 'prefix'}];
            expect($scope.validateUri('prefix:')).toBeFalsy();
        });

        it('should return true when prefix is in namespace and there is a sufix', function () {
            $httpBackend.flush();
            $scope.namespaces = [{'prefix': 'prefix'}];
            expect($scope.validateUri('prefix:asdf')).toBeTruthy();
        });
    });

    describe('$scope.checkValid()', function () {
        it('should return message when is not defined', function () {
            $httpBackend.flush();
            expect($scope.checkValid()).toEqual("Please enter a valid value.");
            expect($scope.checkValid(undefined)).toEqual("Please enter a valid value.");
        });

        it('should return true when is defined', function () {
            $httpBackend.flush();
            expect($scope.checkValid('asdf')).toBeTruthy();
        });
    });
});
