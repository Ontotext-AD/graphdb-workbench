import 'angular/core/directives/queryeditor/query-editor.controller';
import 'angular/rest/sparql.rest.service';
import {FakeModal} from "../../../mocks";

describe('QueryEditor', function () {

    beforeEach(angular.mock.module('graphdb.framework.core.directives.queryeditor.controllers'));

    describe('QueryEditorCtrl', function () {

        let $scope;
        let $timeout;
        let toastr;
        let $repositories;
        let $modal;
        let ModalService;
        let SparqlRestService;
        let $filter;
        let $window;
        let $jwtAuth;
        let RDF4JRepositoriesRestService;
        let MonitoringRestService;
        let LocalStorageAdapter;
        let LSKeys;
        let $controller;
        let createController;
        let $httpBackend;

        beforeEach(angular.mock.inject(function (_$rootScope_, _$timeout_, _toastr_, _$repositories_, _$modal_, _ModalService_, _SparqlRestService_, _$filter_, _$window_, _$jwtAuth_, _RDF4JRepositoriesRestService_, _MonitoringRestService_, _LocalStorageAdapter_, _LSKeys_, $q, _$controller_, _$httpBackend_) {
            $scope = _$rootScope_.$new();
            $timeout = _$timeout_;
            toastr = _toastr_;
            $repositories = _$repositories_;
            $modal = new FakeModal($q, _$rootScope_);
            ModalService = _ModalService_;
            SparqlRestService = _SparqlRestService_;
            $filter = _$filter_;
            $window = _$window_;
            $jwtAuth = _$jwtAuth_;
            RDF4JRepositoriesRestService = _RDF4JRepositoriesRestService_;
            MonitoringRestService = _MonitoringRestService_;
            LocalStorageAdapter = _LocalStorageAdapter_;
            LSKeys = _LSKeys_;
            $controller = _$controller_;
            $httpBackend = _$httpBackend_;

            createController = () => $controller('QueryEditorCtrl', {
                $scope,
                $timeout,
                toastr,
                $repositories,
                $modal,
                ModalService,
                SparqlRestService,
                $filter,
                $window,
                $jwtAuth,
                RDF4JRepositoriesRestService,
                MonitoringRestService,
                LocalStorageAdapter,
                LSKeys
            });

            // Should mock this method, because of special implementation in repositories.service.js
            $repositories.isActiveRepoOntopType = function () {
                return false;
            }

            // Clear the local storage because it makes the test dependent on each other.
            spyOn(LocalStorageAdapter, 'set').and.callFake(() => {});
            LocalStorageAdapter.clearAll();

            createController();
        }));

        describe('initTabs', function () {
            it('should set default tab and delete cached sparql results', function () {
                spyOn(LocalStorageAdapter, 'get').and.returnValue(null);
                spyOn($jwtAuth, 'getPrincipal').and.returnValue({
                    appSettings: {
                        DEFAULT_INFERENCE: false,
                        DEFAULT_SAMEAS: false,
                        EXECUTE_COUNT: true,
                        IGNORE_SHARED_QUERIES: true
                    }
                });

                createController();

                expect($scope.skipCountQuery).toEqual(false);
                expect($scope.ignoreSharedQueries).toEqual(true);
                // Expect default tab config to be set for a single tab
                const expectedTabs = [{
                    id: "1",
                    name: '',
                    query: 'select * where { \n' +
                    '\t?s ?p ?o .\n' +
                    '} limit 100 \n',
                    inference: false,
                    sameAs: false
                }];
                expect($scope.tabs).toEqual(expectedTabs);
                expect($scope.tabsData).toEqual(expectedTabs);
            });

            it('should load cached tabs and delete cached sparql results', function () {
                spyOn(LocalStorageAdapter, 'get').and.callFake(function (key) {
                    if (key === LSKeys.TABS_STATE) {
                        return [
                            {id: 'tab-0', name: 'first tab', query: 'query-0', inference: false, sameAs: false, yasrData:'yasrData', queryType: 'select', resultsCount: 100, allResultsCount: 100, sizeDelta: 100},
                            {id: 'tab-1', name: 'second tab', query: 'query-1', inference: false, sameAs: false, yasrData:'yasrData', queryType: 'select', resultsCount: 100, allResultsCount: 100, sizeDelta: 100}
                            ];
                    }
                    return null;
                });
                spyOn($jwtAuth, 'getPrincipal').and.returnValue({
                    appSettings: {
                        DEFAULT_INFERENCE: false,
                        DEFAULT_SAMEAS: false,
                        EXECUTE_COUNT: true,
                        IGNORE_SHARED_QUERIES: true
                    }
                });

                createController();

                expect($scope.skipCountQuery).toEqual(false);
                expect($scope.ignoreSharedQueries).toEqual(true);
                // Expect default tab config to be set for a single tab
                const expectedTabs = [
                    {id: 'tab-0', name: 'first tab', query: 'query-0', inference: false, sameAs: false, yasrData:'yasrData', queryType: 'select', resultsCount: 100, allResultsCount: 100, sizeDelta: 100},
                    {id: 'tab-1', name: 'second tab', query: 'query-1', inference: false, sameAs: false, yasrData:'yasrData', queryType: 'select', resultsCount: 100, allResultsCount: 100, sizeDelta: 100}
                    ];
                expect($scope.tabs).toEqual(expectedTabs);
                expect($scope.tabsData).toEqual(expectedTabs);

                $scope.$broadcast('repositoryIsSet', {newRepo: true});

                // Should be reset
                const expectedResettedTabs = [
                    {id: 'tab-0', name: 'first tab', query: 'query-0', inference: false, sameAs: false, yasrData: undefined, queryType: undefined, resultsCount: 0, allResultsCount: 0, sizeDelta: undefined},
                    {id: 'tab-1', name: 'second tab', query: 'query-1', inference: false, sameAs: false, yasrData: undefined, queryType: undefined, resultsCount: 0, allResultsCount: 0, sizeDelta: undefined}
                ];
                expect($scope.tabs).toEqual(expectedResettedTabs);
                expect($scope.tabsData).toEqual(expectedResettedTabs);
                expect(LocalStorageAdapter.set).toHaveBeenCalledWith(LSKeys.TABS_STATE, expectedResettedTabs);
                expect($scope.currentQuery).toEqual({});

                // Should not reset anything if different repo is not selected
                $scope.$broadcast('repositoryIsSet', {newRepo: false});
                expect($scope.tabs).toEqual(expectedResettedTabs);
                expect($scope.tabsData).toEqual(expectedResettedTabs);
            });
        });

        describe('saveQueryToLocal', function () {
            it('should update tab info and update the cache', function () {
                $scope.tabs = [
                    {id: 'tab-0', query: 'query-0', inference: false, sameAs: false},
                    {id: 'tab-1', query: 'query-1', inference: false, sameAs: false},
                    {id: 'tab-2', query: 'query-2', inference: false, sameAs: false},
                    {id: 'tab-3', query: 'query-3', inference: false, sameAs: false}
                ];

                $scope.saveQueryToLocal({
                    id: 'tab-1',
                    query: 'query-modified',
                    inference: true,
                    sameAs: true
                });

                expect($scope.tabs[1]).toEqual({
                    id: 'tab-1',
                    query: 'query-modified',
                    inference: true,
                    sameAs: true
                });
                expect(LocalStorageAdapter.set).toHaveBeenCalledWith(LSKeys.TABS_STATE, [
                    {id: 'tab-0', query: 'query-0', inference: false, sameAs: false},
                    {id: 'tab-1', query: 'query-modified', inference: true, sameAs: true},
                    {id: 'tab-2', query: 'query-2', inference: false, sameAs: false},
                    {id: 'tab-3', query: 'query-3', inference: false, sameAs: false}
                ]);
            });
        });

        describe('querySelected', () => {
            it('should select tab', () => {
                $scope.showSampleQueries = true;
                $scope.tabsData = [
                    {id: 'tab-0', name: 'first tab', query: 'query-0', inference: false, sameAs: false},
                    {id: 'tab-1', name: 'second tab', query: 'query-1', inference: false, sameAs: false}
                ];
                let elementMock = {
                    collapse: jasmine.createSpy(),
                    tab: jasmine.createSpy()
                };
                spyOn(window, '$').and.returnValue(elementMock);
                $httpBackend.when('GET', 'rest/security/all').respond(200);

                $scope.querySelected({
                    name: 'second tab',
                    body: 'query-1'
                });
                $timeout.flush();

                expect(elementMock.collapse).toHaveBeenCalled();
                expect(elementMock.tab).toHaveBeenCalledWith('show');
            });

            it('should add new tab', () => {
                $scope.showSampleQueries = true;
                let elementMock = {
                    collapse: jasmine.createSpy(),
                    tab: jasmine.createSpy(),
                    mouseup: jasmine.createSpy()
                };
                spyOn(window, '$').and.returnValue(elementMock);
                spyOn($jwtAuth, 'getPrincipal').and.returnValue({
                    appSettings: {
                        DEFAULT_INFERENCE: false,
                        DEFAULT_SAMEAS: false,
                        EXECUTE_COUNT: true,
                        IGNORE_SHARED_QUERIES: true
                    }
                });
                $httpBackend.when('GET', 'rest/security/all').respond(200);
                $httpBackend.when('GET', 'rest/sparql/saved-queries').respond(200);

                createController();
                $scope.tabsData = [
                    {id: 'tab-0', name: 'first tab', query: 'query-0', inference: false, sameAs: false},
                    {id: 'tab-1', name: 'second tab', query: 'query-1', inference: false, sameAs: false}
                ];

                // This query won't match any tab and will force new tab to be added
                $scope.querySelected({
                    name: 'third tab',
                    body: 'query-1'
                });
                $timeout.flush();

                expect(elementMock.tab).toHaveBeenCalledWith('show');
                expect($scope.tabsData).toEqual([
                    {id: '1', name: '', query: 'select * where { \n' +
                        '\t?s ?p ?o .\n' +
                        '} limit 100 \n', inference: false, sameAs: false},
                    {id: '2', name: 'third tab', query: 'query-1', inference: false, sameAs: false}
                ]);
            });
        });
    });
});
