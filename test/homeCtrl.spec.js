describe('homeCtrl', function () {

    beforeEach(angular.mock.module('graphdb.workbench.se.controllers'));

    beforeEach(angular.mock.module(function ($provide) {
        $provide.service('$jwtAuth', function () {
            this.initSecurity = jasmine.createSpy('initSecurity').and.callFake(function () {
                // do nothing
            });
        });
    }));

    let $scope;
    let $http;
    let $repositories;
    let LicenseRestService;
    let ClassInstanceDetailsService;
    let AutocompleteRestService;
    let RepositoriesRestService;
    let $controller;
    let $httpBackend;
    let createController;

    beforeEach(angular.mock.inject(function (_$rootScope_, _$http_, _$repositories_, _ClassInstanceDetailsService_, _AutocompleteRestService_, _LicenseRestService_, _RepositoriesRestService_, _$controller_, _$httpBackend_) {
        $scope = _$rootScope_.$new();
        $http = _$http_;
        $repositories = _$repositories_;
        LicenseRestService = _LicenseRestService_;
        ClassInstanceDetailsService = _ClassInstanceDetailsService_;
        AutocompleteRestService = _AutocompleteRestService_;
        RepositoriesRestService = _RepositoriesRestService_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;

        // Create a mock for this function. Although it's defined in the mainCtrl it's called in the homeCtrl which is
        // weird.
        $scope.getActiveRepository = () => {
        };

        $scope.checkLicenseStatus = () => {
            
        };

        createController = () => $controller('homeCtrl', {
            $scope, $http, $repositories, ClassInstanceDetailsService, AutocompleteRestService, LicenseRestService, RepositoriesRestService
        });

        createController();
    }));

    describe('getActiveRepositorySize', () => {
        beforeEach(() => {
            $httpBackend.when('GET', 'rest/graphdb-settings/license').respond(200, 'licenseinfo');
            $httpBackend.when('GET', 'rest/graphdb-settings/license/hardcoded').respond(200, 'true');
        });

        it('should not initialize repository size variable if active repository is not set', () => {
            $scope.activeRepositorySize = undefined;
            $scope.activeRepositorySizeError = undefined;

            $scope.getActiveRepositorySize();

            expect($scope.activeRepositorySize).toBeUndefined();
            expect($scope.activeRepositorySizeError).toBeUndefined();
        });

        it('should initialize repository size variable', () => {
            $httpBackend.when('GET', 'rest/repositories/active-repo/size').respond(200, '2000000');
            $scope.activeRepositorySize = undefined;
            $scope.activeRepositorySizeError = undefined;
            spyOn($repositories, 'getActiveRepository').and.returnValue('active-repo');

            $scope.getActiveRepositorySize();
            $httpBackend.flush();

            expect($scope.activeRepositorySize).toEqual('2000000');
            expect($scope.activeRepositorySizeError).toBeUndefined();
        });

        it('should set error message if getting repository size fails', () => {
            $httpBackend.when('GET', 'rest/repositories/active-repo/size').respond(500, {
                message: 'Repository size read error!'
            });
            $scope.activeRepositorySize = undefined;
            $scope.activeRepositorySizeError = undefined;
            spyOn($repositories, 'getActiveRepository').and.returnValue('active-repo');

            $scope.getActiveRepositorySize();
            $httpBackend.flush();

            expect($scope.activeRepositorySize).toBeUndefined();
            expect($scope.activeRepositorySizeError).toEqual('Repository size read error!');
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
