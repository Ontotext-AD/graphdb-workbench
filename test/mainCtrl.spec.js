import 'angular/controllers';
import 'angular/core/services';
import 'angular/explore/app';
import 'angular/settings/services';
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
    let $cookies;
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
    let LicenseService;
    let $controller;
    let $httpBackend;
    let createController;
    let $modal;

    beforeEach(angular.mock.inject(function (_$rootScope_, $menuItems, _$jwtAuth_, _$http_, _$cookies_, _toastr_, _$location_, _$repositories_, _localStorageService_, _productInfo_, _$timeout_, _ModalService_, _$interval_, _$filter_, _LicenseService_, _$controller_, _$httpBackend_, $q) {
        $scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        menuItems = $menuItems;
        $http = _$http_;
        $jwtAuth = _$jwtAuth_;
        $cookies = _$cookies_;
        toastr = _toastr_;
        $location = _$location_;
        $repositories = _$repositories_;
        localStorageService = _localStorageService_;
        productInfo = _productInfo_;
        $timeout = _$timeout_;
        ModalService = _ModalService_;
        $interval = _$interval_;
        $filter = _$filter_;
        LicenseService = _LicenseService_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $modal = new FakeModal($q, _$rootScope_);

        createController = () => $controller('mainCtrl', {
            $scope, menuItems, $jwtAuth, $http, $cookies, toastr, $location, $repositories, $rootScope, localStorageService, productInfo, $timeout, ModalService, $interval, $filter, LicenseService
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

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
