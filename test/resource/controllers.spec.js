import {bundle} from "../test-main";

beforeEach(angular.mock.module('graphdb.framework.explore.controllers'));

beforeEach(angular.mock.module(function($provide) {
    $provide.service('$languageService', function() {
        this.getLanguage = function() {
            return 'en';
        }
    });
}));

describe('=> EditResourceCtrl', function () {
    var $repositories,
        $httpBackend,
        $location,
        $controller,
        $timeout,
        $window,
        ClassInstanceDetailsService,
        StatementsService,
        $scope,
        $translate;

    beforeEach(angular.mock.inject(function (_$repositories_, _$httpBackend_, _$location_, _$controller_, _$window_, _$timeout_, _ClassInstanceDetailsService_, _StatementsService_, $rootScope, _$translate_) {
        $repositories = _$repositories_;
        $httpBackend = _$httpBackend_;
        $location = _$location_;
        $controller = _$controller_;
        $window = _$window_;
        $timeout = _$timeout_;
        ClassInstanceDetailsService = _ClassInstanceDetailsService_;
        StatementsService = _StatementsService_;
        $scope = $rootScope.$new();
        $translate = _$translate_;

        $translate.instant = function (key) {
            return bundle[key];
        }

        $httpBackend.when('GET', 'rest/locations').respond(200, {});

        $controller('EditResourceCtrl', {$scope: $scope, $translate: $translate});

        $httpBackend.when('GET', 'rest/security/all').respond(200, {
            enabled: true,
            freeAccess: {enabled: false},
            overrideAuth: {enabled: false}
        });

        $httpBackend.when('GET', 'rest/security/authenticated-user').respond(401, 'Authentication required');

        $httpBackend.when('GET', 'repositories/activeRepository/namespaces').respond(200, {
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
        $httpBackend.when('GET', 'rest/explore/details').respond(200, {});
        $httpBackend.when('GET', 'repositories/activeRepository/namespaces').respond(200, {
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
        $httpBackend.when('GET', 'rest/explore/graph?uri=undefined&role=subject').respond(200, {});
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
