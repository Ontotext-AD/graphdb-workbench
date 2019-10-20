import 'angular/export/controllers';
import {FakeModal} from '../mocks';

beforeEach(angular.mock.module('graphdb.framework.impex.export.controllers'));

describe('==> ExportCtrl tests', function () {
    let createController;
    let $jwtAuth;
    let $controller;
    let $httpBackend;
    let $scope;
    let modalInstance;
    let controller;
    let $timeout;
    let $repositories;
    let toastr;
    let filterFilter;

    beforeEach(angular.mock.inject(function (_$jwtAuth_, _$controller_, _$httpBackend_, $rootScope, $q, _$timeout_, _$repositories_, _toastr_, _filterFilter_) {
        $jwtAuth = _$jwtAuth_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        modalInstance = new FakeModal($q, $rootScope);
        $timeout = _$timeout_;
        $scope = $rootScope.$new();
        $repositories = _$repositories_;
        toastr = _toastr_;
        filterFilter = _filterFilter_;

        createController = () => $controller('ExportCtrl', {
            $scope: $scope,
            ModalService: modalInstance,
            $repositories: $repositories,
            toastr: toastr,
            filterFilter: filterFilter
        });
        createController();

        $scope.graphsByValue = {
            test: {
                value: 'test',
                type: 'uri',
                uri: 'uri',
                exportUri: '<test>',
                clearUri: '<test>',
                longName: 'test'
            }
        };

        spyOn($scope, 'getGraphs').and.callFake(() => true);

        $httpBackend.when('GET', 'rest/security/all').respond(200, {
            enabled: true,
            freeAccess: {enabled: false},
            overrideAuth: {enabled: false}
        });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('dropRepository', () => {
        it('should not drop repository if writing in current repository is not allowed', () => {
            $httpBackend.flush();

            $scope.canWriteActiveRepo = () => false;

            $scope.dropRepository();

            expect($scope.deleting['*']).toBeUndefined();
        });

        it('should drop repository and show success notification', () => {
            const repositoryId = 'active-repo';
            $scope.canWriteActiveRepo = () => true;
            spyOn($repositories, 'getActiveRepository').and.returnValue(repositoryId);
            spyOn(modalInstance, 'openSimpleModal').and.callThrough();
            spyOn(toastr, 'success').and.callThrough();
            $httpBackend.when('POST', `repositories/${repositoryId}/statements`).respond(200);

            $scope.dropRepository();

            modalInstance.close();
            $timeout.flush();
            $httpBackend.flush();

            expect(modalInstance.openSimpleModal).toHaveBeenCalledWith({
                title: 'Confirm clear repository',
                message: `Are you sure you want to clear repository ${repositoryId}?`,
                warning: true
            });
            expect(toastr.success).toHaveBeenCalledWith(`Cleared repository ${repositoryId}`);
            expect($scope.deleting['*']).toEqual(false);
        });

        it('should show error notification if drop repository fails', () => {
            const repositoryId = 'active-repo';
            $scope.canWriteActiveRepo = () => true;
            spyOn($repositories, 'getActiveRepository').and.returnValue(repositoryId);
            spyOn(toastr, 'error').and.callThrough();
            $httpBackend.when('POST', `repositories/${repositoryId}/statements`).respond(500, {
                message: 'Drop repository failed!'
            });

            $scope.dropRepository();

            modalInstance.close();
            $timeout.flush();
            $httpBackend.flush();

            const firstCall = toastr.error.calls.first();
            expect(firstCall.args[0]).toEqual(`Failed to clear repository ${repositoryId}`);
            expect(firstCall.args[1].data.message).toEqual('Drop repository failed!');
            expect($scope.deleting['*']).toEqual(false);
        });
    });

    describe('dropContext', () => {
        describe('when a graph is selected', () => {
            const repositoryId = 'active-repo';
            const ctx = {
                contextID: {
                    longName: 'default graph'
                }
            };

            it('should not drop graph if writing in current repository is not allowed', () => {
                $httpBackend.flush();

                $scope.canWriteActiveRepo = () => false;

                $scope.dropContext('graph');

                expect($scope.deleting['graph']).toBeUndefined();
            });

            it('should drop graph', () => {
                $scope.graphs = ['g1', 'g2'];
                $scope.canWriteActiveRepo = () => true;
                spyOn($repositories, 'getActiveRepository').and.returnValue(repositoryId);
                spyOn(modalInstance, 'openSimpleModal').and.callThrough();
                spyOn(toastr, 'success').and.callThrough();
                $scope.updateResults = jasmine.createSpy();
                $httpBackend.expectPOST(`repositories/${repositoryId}/statements`, `update=CLEAR ${ctx.contextID.clearUri}`)
                    .respond(200);

                $scope.dropContext(ctx);

                modalInstance.close();
                $timeout.flush();
                $httpBackend.flush();

                expect(modalInstance.openSimpleModal).toHaveBeenCalledWith({
                    title: 'Confirm clear graph',
                    message: `Are you sure you want to clear the ${ctx.contextID.longName}?`,
                    warning: true
                });
                expect($scope.deleting[ctx]).toEqual(false);
                expect(toastr.success).toHaveBeenCalledWith(`Cleared the ${ctx.contextID.longName}`);
                expect($scope.getGraphs).toHaveBeenCalled();
                expect($scope.exportFilter).toEqual('');
                expect($scope.filteredGraphs.length).toEqual(0);
                expect($scope.updateResults).toHaveBeenCalled();
                // the $scope.changePageSize should be called
                expect($scope.page).toEqual(1);
            });

            it('should show error notification if drop graph fails', () => {
                $scope.graphs = ['g1', 'g2'];
                $scope.canWriteActiveRepo = () => true;
                spyOn($repositories, 'getActiveRepository').and.returnValue(repositoryId);
                spyOn(modalInstance, 'openSimpleModal').and.callThrough();
                spyOn(toastr, 'error').and.callThrough();
                $httpBackend.when('POST', `repositories/${repositoryId}/statements`).respond(500, {
                    message: 'Drop graph failied!'
                });

                $scope.dropContext(ctx);

                modalInstance.close();
                $timeout.flush();
                $httpBackend.flush();

                expect($scope.deleting[ctx]).toEqual(false);
                expect(toastr.error).toHaveBeenCalledWith(`Failed to clear the ${ctx.contextID.longName}`, 'Drop graph failied!');
            });
        });
    });

    describe('$scope.changePageSize', function () {
        it('sets the $scope.pageSize correct', function () {
            $httpBackend.flush();

            $scope.filteredGraphs = [];
            $scope.pageSize = 10;
            $scope.changePageSize(20);
            expect($scope.pageSize).toEqual(20);
            $scope.changePageSize(10);
            expect($scope.pageSize).toEqual(10);
            $scope.changePageSize();
            expect($scope.pageSize).toEqual(10);
        });

        it('sets the $scope.displayGraphs correct', function () {
            $httpBackend.flush();

            $scope.filteredGraphs = [];
            $scope.changePageSize();
            expect($scope.displayGraphs.length).toEqual(0);
            $scope.changePageSize(10);
            expect($scope.displayGraphs.length).toEqual(0);
            $scope.filteredGraphs = [1, 2, 3, 4, 5];
            $scope.changePageSize(2);
            expect($scope.displayGraphs.length).toEqual(2);
            $scope.changePageSize(5);
            expect($scope.displayGraphs.length).toEqual(5);
        });
    });

    describe('$scope.exportRepo()', function () {
        it('should call $scope.startDownload() with the correct format data', function () {
            $httpBackend.flush();

            var exportFormats = [
                {type: 'application/rdf+json'},
                {type: 'application/ld+json'},
                {type: 'text/x-nquads'},
                {type: 'application/trix'},
                {type: 'application/x-trig'},
                {type: 'application/x-binary-rdf'}
            ];
            modalInstance.open = jasmine.createSpy('modalInstance.open');
            var startDownload = {};
            $scope.startDownload = function (type, graph) {
                startDownload = {type: type, graph: 'graph'}
            };
            for (var i = 0; i < exportFormats.length; i++) {
                $scope.exportRepo(exportFormats[i].type, 'graph');
                expect(startDownload).toEqual({type: exportFormats[i].type, graph: 'graph'});
                expect(modalInstance.open).not.toHaveBeenCalled();
            }
        });

        it('should open modal and call $scope.startDownload() on modal.close', function () {
            $httpBackend.flush();

            var exportFormats = [
                {type: 'application/rdf+xml'},
                {type: 'text/rdf+n3'},
                {type: 'text/plain'},
                {type: 'text/turtle'}
            ];
            var startDownload = {};
            $scope.startDownload = function (type, graph) {
                startDownload = {type: type, graph: 'graph'}
            };
            modalInstance.open = jasmine.createSpy('modalInstance.open');
            for (var i = 0; i < exportFormats.length; i++) {
                $scope.exportRepo(exportFormats[i].type, 'graph');
                modalInstance.close = jasmine.createSpy('modalInstance.close');
                expect(startDownload).toEqual({type: exportFormats[i].type, graph: 'graph'});
            }
        });
    });

    describe('$scope.exportSelectedGraphs()', function () {
        it('should open modal when there is no selected graphs', function () {
            $httpBackend.flush();

            $scope.selectedGraphs = {exportGraphs: {'test': false}};
            modalInstance.openSimpleModal = jasmine.createSpy('modalInstance.openSimpleModal');
            $scope.exportSelectedGraphs({type: "application/x-trig"});
            expect(modalInstance.openSimpleModal).toHaveBeenCalled();

            $scope.selectedGraphs = {exportGraphs: {}};
            modalInstance.openSimpleModal = jasmine.createSpy('modalInstance.openSimpleModal');
            $scope.exportSelectedGraphs({type: "application/x-trig"});
            expect(modalInstance.openSimpleModal).toHaveBeenCalled();
        });

        it('should call $scope.downloadExport and not open modal', function () {
            $httpBackend.flush();

            $scope.getActiveRepository = function () {
                return 'activeRepository'
            };
            var exportFormats = [
                {type: 'application/rdf+json'},
                {type: 'application/ld+json'},
                {type: 'text/x-nquads'},
                {type: 'application/trix'},
                {type: 'application/x-trig'},
                {type: 'application/x-binary-rdf'}
            ];
            var downloadExport;
            $scope.downloadExport = function () {
                downloadExport = true;
            };
            modalInstance.openSimpleModal = jasmine.createSpy('modalInstance.openSimpleModal');
            for (var i = 0; i < exportFormats.length; i++) {
                downloadExport = false;
                $scope.selectedGraphs = {exportGraphs: {'test': true}};
                $scope.exportSelectedGraphs(exportFormats[i]);
                expect(modalInstance.openSimpleModal).not.toHaveBeenCalled();
                expect(downloadExport).toBeTruthy();
            }
        });

        it('should open modal and call $scope.downloadExport on modal.close', function () {
            $httpBackend.flush();

            $scope.getActiveRepository = function () {
                return 'activeRepository'
            };
            var exportFormats = [
                {type: 'application/rdf+xml'},
                {type: 'text/rdf+n3'},
                {type: 'text/plain'},
                {type: 'text/turtle'}
            ];
            var downloadExport;
            $scope.downloadExport = function () {
                downloadExport = true;
            };
            for (var i = 0; i < exportFormats.length; i++) {
                downloadExport = false;
                $scope.selectedGraphs = {exportGraphs: {'test': true}};
                $scope.exportSelectedGraphs(exportFormats[i]);
                expect(downloadExport).toBeFalsy();
                modalInstance.close = jasmine.createSpy('modalInstance.close');
                expect($scope.downloadExport).toBeTruthy();
            }
        });
    });
});
