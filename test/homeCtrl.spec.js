describe('homeCtrl', function () {

    beforeEach(angular.mock.module('graphdb.workbench.se.controllers'));

    beforeEach(angular.mock.module(function($provide) {
        $provide.service('$jwtAuth', function() {
            this.initSecurity = jasmine.createSpy('initSecurity').and.callFake(function() {
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
    let $controller;
    let $httpBackend;
    let createController;

    beforeEach(angular.mock.inject(function (_$rootScope_, _$http_, _$repositories_, _ClassInstanceDetailsService_, _AutocompleteRestService_, _LicenseRestService_, _$controller_, _$httpBackend_) {
        $scope = _$rootScope_.$new();
        $http = _$http_;
        $repositories = _$repositories_;
        LicenseRestService = _LicenseRestService_;
        ClassInstanceDetailsService = _ClassInstanceDetailsService_;
        AutocompleteRestService = _AutocompleteRestService_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;

        // Create a mock for this function. Although it's defined in the mainCtrl it's called in the homeCtrl which is
        // weird.
        $scope.getActiveRepository = () => {};

        createController = () => $controller('homeCtrl', {
            $scope, $http, $repositories, ClassInstanceDetailsService, AutocompleteRestService, LicenseRestService
        });

        createController();
    }));

    describe('checkLicenseStatus', function () {
        it('should init with hardcoded license', function () {
            $httpBackend.when('GET', 'rest/graphdb-settings/license').respond(200, 'licenseinfo');
            $httpBackend.when('GET', 'rest/graphdb-settings/license/hardcoded').respond(200, 'true');
            $scope.isLicenseHardcoded = false;
            $scope.license = undefined;
            $httpBackend.expectGET('rest/graphdb-settings/license');

            $httpBackend.flush();

            expect($scope.isLicenseHardcoded).toBeTruthy();
            expect($scope.license).toEqual('licenseinfo');
        });

        it('should fail when license is not found', function () {
            $httpBackend.when('GET', 'rest/graphdb-settings/license').respond(500);
            $httpBackend.when('GET', 'rest/graphdb-settings/license/hardcoded').respond(200, 'true');
            $scope.isLicenseHardcoded = false;
            $scope.license = undefined;
            $httpBackend.expectGET('rest/graphdb-settings/license');

            $httpBackend.flush();

            expect($scope.isLicenseHardcoded).toBeTruthy();
            expect($scope.license).toEqual({message: 'No license was set.', valid: false});
        });

        it('should init when license is not hardcoded', function () {
            $httpBackend.when('GET', 'rest/graphdb-settings/license').respond(200, 'licenseinfo');
            $httpBackend.when('GET', 'rest/graphdb-settings/license/hardcoded').respond(200, 'false');
            $scope.isLicenseHardcoded = false;
            $scope.license = undefined;
            $httpBackend.expectGET('rest/graphdb-settings/license');

            $httpBackend.flush();

            expect($scope.isLicenseHardcoded).toBeFalsy();
            expect($scope.license).toEqual('licenseinfo');
        });

        it('should init when checking license fails', function () {
            $httpBackend.when('GET', 'rest/graphdb-settings/license/hardcoded').respond(500);
            $scope.isLicenseHardcoded = false;
            $scope.license = undefined;

            $httpBackend.flush();

            expect($scope.isLicenseHardcoded).toBeTruthy();
            expect($scope.license).toBeUndefined();
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
