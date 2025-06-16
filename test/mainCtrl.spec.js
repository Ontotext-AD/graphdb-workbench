import 'angular/controllers';
import 'angular/core/services';
import 'angular/explore/app';
import 'angular/rest/license.rest.service';
import {FakeModal} from "./mocks";

describe('mainCtrl', function () {

    beforeEach(angular.mock.module('graphdb.workbench.se.controllers'));

    beforeEach(angular.mock.module(function($provide) {
        $provide.service('$jwtAuth', function() {
            this.initSecurity = jasmine.createSpy('initSecurity').and.callFake(function() {
                // do nothing
            });
        });
    }));

    let $scope;
    let menuItems;
    let $http;
    let $jwtAuth;
    let toastr;
    let $location;
    let $repositories;
    let $rootScope;
    let localStorageService;
    let productInfo;
    let $timeout;
    let ModalService;
    let $interval;
    let $filter;
    let LicenseRestService;
    let RepositoriesRestService;
    let $controller;
    let $httpBackend;
    let createController;
    let $uibModal;

    beforeEach(angular.mock.inject(function (_$rootScope_, $menuItems, _$jwtAuth_, _$http_, _toastr_, _$location_, _$repositories_, _localStorageService_, _productInfo_, _$timeout_, _ModalService_, _$interval_, _$filter_, _LicenseRestService_, _RepositoriesRestService_, _$controller_, _$httpBackend_, $q) {
        $scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        menuItems = $menuItems;
        $http = _$http_;
        $jwtAuth = _$jwtAuth_;
        toastr = _toastr_;
        $location = _$location_;
        $repositories = _$repositories_;
        localStorageService = _localStorageService_;
        productInfo = _productInfo_;
        $timeout = _$timeout_;
        ModalService = _ModalService_;
        $interval = _$interval_;
        $filter = _$filter_;
        LicenseRestService = _LicenseRestService_;
        RepositoriesRestService = _RepositoriesRestService_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $uibModal = new FakeModal($q, _$rootScope_);

        createController = () => $controller('mainCtrl', {
            $scope, menuItems, $jwtAuth, $http, toastr, $location, $repositories, $rootScope, localStorageService, productInfo, $timeout, ModalService, $interval, $filter, LicenseRestService, RepositoriesRestService
        });

        createController();
    }));

    describe('checkLicenseStatus', function () {
        it('should init with hardcoded license', function () {
            $httpBackend.when('GET', 'rest/graphdb-settings/license').respond(200, 'licenseinfo');
            $httpBackend.when('GET', 'rest/graphdb-settings/license/hardcoded').respond(200, 'true');
            $scope.isLicenseHardcoded = false;
            $scope.license = undefined;
            $scope.showLicense = false;
            $httpBackend.expectGET('rest/graphdb-settings/license');

            $scope.checkLicenseStatus();
            $httpBackend.flush();

            expect($scope.isLicenseHardcoded).toBeTruthy();
            expect($scope.license).toEqual('licenseinfo');
            expect($scope.showLicense).toBeTruthy();
        });

        it('should fail when license is not found', function () {
            $httpBackend.when('GET', 'rest/graphdb-settings/license').respond(500);
            $httpBackend.when('GET', 'rest/graphdb-settings/license/hardcoded').respond(200, 'true');
            $scope.isLicenseHardcoded = false;
            $scope.license = undefined;
            $scope.showLicense = false;
            $httpBackend.expectGET('rest/graphdb-settings/license');

            $scope.checkLicenseStatus();
            $httpBackend.flush();

            expect($scope.isLicenseHardcoded).toBeTruthy();
            expect($scope.license).toEqual({message: 'No license was set.', valid: false});
            expect($scope.showLicense).toBeTruthy();
        });

        it('should init when license is not hardcoded', function () {
            $httpBackend.when('GET', 'rest/graphdb-settings/license').respond(200, 'licenseinfo');
            $httpBackend.when('GET', 'rest/graphdb-settings/license/hardcoded').respond(200, 'false');
            $scope.isLicenseHardcoded = false;
            $scope.license = undefined;
            $scope.showLicense = false;
            $httpBackend.expectGET('rest/graphdb-settings/license');

            $scope.checkLicenseStatus();
            $httpBackend.flush();

            expect($scope.isLicenseHardcoded).toBeFalsy();
            expect($scope.license).toEqual('licenseinfo');
            expect($scope.showLicense).toBeTruthy();
        });

        it('should init when checking license fails', function () {
            $httpBackend.when('GET', 'rest/graphdb-settings/license/hardcoded').respond(500);
            $scope.isLicenseHardcoded = false;
            $scope.license = undefined;
            $scope.showLicense = false;

            $scope.checkLicenseStatus();
            $httpBackend.flush();

            expect($scope.isLicenseHardcoded).toBeTruthy();
            expect($scope.license).toBeUndefined();
            expect($scope.showLicense).toBeFalsy();
        });
    });

    describe('getRepositorySize', () => {
        it('should set repository size variable when repository is hovered', () => {
            $httpBackend.when('GET', 'rest/repositories/repoId/size').respond(200, '2000000');
            $scope.popoverRepo = { id: 'repoId' };
            $scope.repositorySize = undefined;

            $scope.getRepositorySize();
            $httpBackend.flush();

            expect($scope.repositorySize).toEqual('2000000');
        });

        it('should not set repository size variable if repository is not hovered', () => {
            $scope.popoverRepo = undefined;
            $scope.repositorySize = undefined;

            $scope.getRepositorySize();

            expect($scope.repositorySize).toEqual({});
        });

        // TODO: Disabled because the method in controller doesn't handle possible http errors and it seems that the loading flag may be left active.
        xit('should not set repository size variable if get repository size fails', () => {
            $httpBackend.when('GET', 'rest/repositories/repoId/size').respond(500, {
                message: 'Get repository size error!'
            });
            $scope.popoverRepo = { id: 'repoId' };
            $scope.repositorySize = undefined;

            $scope.getRepositorySize();
            $httpBackend.flush();

            expect($scope.repositorySize).toEqual({});
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
