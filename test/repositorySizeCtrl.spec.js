describe('repositorySizeCtrl', function () {

    beforeEach(angular.mock.module('graphdb.workbench.se.controllers'));

    let $scope;
    let $http;
    let RepositoriesRestService;
    let $controller;
    let $httpBackend;
    let createController;

    beforeEach(angular.mock.inject(function (_$rootScope_, _$http_, _RepositoriesRestService_, _$controller_, _$httpBackend_) {
        $scope = _$rootScope_.$new();
        $http = _$http_;
        RepositoriesRestService = _RepositoriesRestService_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;

        createController = () => $controller('repositorySizeCtrl', {
            $scope, $http, RepositoriesRestService
        });

        createController();
    }));

    describe('getRepositorySize', () => {
        it('should set repository size variable', () => {
            $httpBackend.when('GET', 'rest/repositories/repoId/size').respond(200, '2000000');
            $scope.size = undefined;

            $scope.getRepositorySize('repoId');
            $httpBackend.flush();

            expect($scope.size).toEqual('2000000');
        });

        it('should handle http error when get repository size fails', () => {
            $httpBackend.when('GET', 'rest/repositories/repoId/size').respond(500, {
                message: 'Get repository size error!'
            });
            $scope.size = undefined;

            $scope.getRepositorySize('repoId');
            $httpBackend.flush();

            expect($scope.size).toBeUndefined();
        });
    });

    afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
