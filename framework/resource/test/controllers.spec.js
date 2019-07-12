//define(["angular/repositories/services",
//    "angular/explore/controllers"],  function() {
//
//    beforeEach(module('graphdb.framework.explore.controllers'));
//
//    describe('=> ExploreCtrl tests', function(){
//        var $repositories,
//            $httpBackend,
//            $location,
//            $controller,
//            $timeout,
//            $window,
//            $scope;
//        beforeEach(inject(function (_$repositories_, _$httpBackend_, _$location_, _$controller_, _$window_, _$timeout_, $rootScope) {
//            $repositories = _$repositories_;
//            $httpBackend = _$httpBackend_;
//            $location = _$location_;
//            $controller = _$controller_;
//            $window = _$window_;
//            $timeout = _$timeout_;
//
//            $scope = $rootScope.$new();
//            var controller = $controller('ExploreCtrl', { $scope: $scope });
//        }));
//
//        afterEach (function () {
//            $httpBackend.verifyNoOutstandingExpectation();
//            $httpBackend.verifyNoOutstandingRequest();
//        });
//
//        describe('$scope.changeRole()', function(){
//            it('should set $scope.role correct nad call $scope.exploreResource()', function(){
//                $scope.role = '';
//                var exploreResource = false;
//                $scope.exploreResource = function(){exploreResource = true}
//                $scope.changeRole('someRole');
//                expect($scope.role).toEqual('someRole');
//                expect(exploreResource).toBeTruthy();
//            })
//        })
//
//        describe('$scope.changeInference()', function(){
//            it('should set $scope.inference correct nad call $scope.exploreResource()', function(){
//                $scope.inference = '';
//                var exploreResource = false;
//                $scope.exploreResource = function(){exploreResource = true}
//                $scope.changeInference('inference');
//                expect($scope.inference).toEqual('inference');
//                expect(exploreResource).toBeTruthy();
//            })
//        })
//        describe('$scope.getLocalName()', function(){
//            it('should return undefined', function(){
//                expect($scope.getLocalName()).toBeUndefined();
//                expect($scope.getLocalName(undefined)).toBeUndefined();
//            })
//            it('should return correct value', function(){
//                expect($scope.getLocalName('some#test/string')).toEqual('string');
//                expect($scope.getLocalName('some/test#string')).toEqual('string');
//                expect($scope.getLocalName('someTest#string')).toEqual('string');
//                expect($scope.getLocalName('someTest/string')).toEqual('string');
//            })
//        })
//    });
//
//    describe('=> EditResourceCtrl', function(){
//        var $repositories,
//            $httpBackend,
//            $location,
//            $controller,
//            $timeout,
//            $window,
//            ClassInstanceDetailsService,
//            $scope;
//        beforeEach(inject(function (_$repositories_, _$httpBackend_, _$location_, _$controller_, _$window_, _$timeout_, _ClassInstanceDetailsService_, $rootScope) {
//            $repositories = _$repositories_;
//            $httpBackend = _$httpBackend_;
//            $location = _$location_;
//            $controller = _$controller_;
//            $window = _$window_;
//            $timeout = _$timeout_;
//            ClassInstanceDetailsService = _ClassInstanceDetailsService_;
//
//            $scope = $rootScope.$new();
//            var controller = $controller('EditResourceCtrl', { $scope: $scope });
//        }));
//
//        afterEach (function () {
//            $httpBackend.verifyNoOutstandingExpectation();
//            $httpBackend.verifyNoOutstandingRequest();
//        });
//
////        describe('$scope.getNamespaceUriForPrefix()', function () {
////            it('should return empty string if prefix is not found', function(){
////                $scope.namespaces = [{'prefix': 'prefix'}];
////                expect($scope.getNamespaceUriForPrefix('otherPrefix')).toEqual('');
////            })
////            it('should return namespace uri if prefix is found', function(){
////                $scope.namespaces = [{'prefix': 'prefix', uri: 'uri'}];
////                expect($scope.getNamespaceUriForPrefix('prefix')).toEqual('uri');
////            })
////        })
//
//        describe('$scope.validateUri()', function(){
//            it('sould return false when there is no ":"', function () {
//                expect($scope.validateUri()).toBeFalsy();
//                expect($scope.validateUri('')).toBeFalsy();
//                expect($scope.validateUri('noTwoDotsHere')).toBeFalsy();
//            });
//            it('should return false when there is not valid URL and no namespace', function () {
//                $scope.namespaces = [];
//                expect($scope.validateUri('someThing:prefix')).toBeFalsy();
//                expect($scope.validateUri('someThing:prefix')).toBeFalsy();
//            })
//            it('should return false when is valid URL but no third "/" in it', function () {
//                $scope.namespaces = [];
//                expect($scope.validateUri('http://some.url')).toBeFalsy();
//                expect($scope.validateUri('https://some.url')).toBeFalsy();
//                expect($scope.validateUri('http://www.some.url')).toBeFalsy();
//                expect($scope.validateUri('https://www.some.url')).toBeFalsy();
//            })
//            it('should return true when is valid URL and there is a third "/" in it', function () {
//                $scope.namespaces = [];
//                expect($scope.validateUri('http://some.url/prefix')).toBeTruthy();
//                expect($scope.validateUri('https://some.url/prefix')).toBeTruthy();
//                expect($scope.validateUri('http://www.some.url/prefix')).toBeTruthy();
//                expect($scope.validateUri('https://www.some.url/prefix')).toBeTruthy();
//            })
//
//            it('should return false when prefix is in namespace but no sufix', function () {
//                $scope.namespaces = [{'prefix': 'prefix'}];
//                expect($scope.validateUri('prefix:')).toBeFalsy();
//            })
//            it('should return true when prefix is in namespace and there is a sufix', function () {
//                $scope.namespaces = [{'prefix': 'prefix'}];
//                expect($scope.validateUri('prefix:asdf')).toBeTruthy();
//            })
//        });
//
//        describe('$scope.checkValid()', function(){
//            it('should return message when is not defined', function(){
//                expect($scope.checkValid()).toEqual("Please enter a valid value.");
//                expect($scope.checkValid(undefined)).toEqual("Please enter a valid value.");
//            });
//            it('should return true when is defined', function(){
//                expect($scope.checkValid('asdf')).toBeTruthy();
//            })
//        });
//    })
//});