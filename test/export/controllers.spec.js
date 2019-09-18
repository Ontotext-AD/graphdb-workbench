import "angular/export/controllers";

beforeEach(angular.mock.module('graphdb.framework.impex.export.controllers'));

describe('==> ExportCtrl tests', function () {
    //test setup
    var $jwtAuth,
        $controller,
        $httpBackend,
        $scope,
        modalInstance,
        controller;

    beforeEach(angular.mock.inject(function (_$jwtAuth_, _$controller_, _$httpBackend_, $rootScope, $q, $injector) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $jwtAuth = _$jwtAuth_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;


        function FakeModal() {
            this.resultDeferred = $q.defer();
            this.result = this.resultDeferred.promise;
        }

        FakeModal.prototype.open = function (options) {
            return this;
        };
        FakeModal.prototype.close = function (item) {
            this.resultDeferred.resolve(item);
            $rootScope.$apply(); // Propagate promise resolution to 'then' functions using $apply().
        };
        FakeModal.prototype.dismiss = function (item) {
            this.resultDeferred.reject(item);
            $rootScope.$apply(); // Propagate promise resolution to 'then' functions using $apply().
        };

        FakeModal.prototype.openSimpleModal = function () {
            return this;
        };

        FakeModal.prototype.openCopyToClipboardModal = function () {
            return this;
        };
        modalInstance = new FakeModal();

        //new a $scope
        $scope = $rootScope.$new();
        controller = $controller('ExportCtrl', {
            $scope: $scope,
            // $modal: modalInstance,
            ModalService: modalInstance
        });

        $scope.graphsByValue = {
            test: {
                value: 'test',
                type: 'uri',
                uri: 'uri',
                exportUri: '<test>',
                clearUri: '<test>',
                longName: 'test'
            }
        }
    }));

    describe('$scope.changePageSize', function () {

        it('sets the $scope.pageSize correct', function () {
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
            var exportFormats = [
                {type: 'application/rdf+json'},
                {type: 'application/ld+json'},
                {type: 'text/x-nquads'},
                {type: 'application/trix'},
                {type: 'application/x-trig'},
                {type: 'application/x-binary-rdf'}
            ]
            modalInstance.open = jasmine.createSpy('modalInstance.open');
            var startDownload = {};
            $scope.startDownload = function (type, graph) {
                startDownload = {type: type, graph: 'graph'}
            }
            for (var i = 0; i < exportFormats.length; i++) {
                $scope.exportRepo(exportFormats[i].type, 'graph');
                expect(startDownload).toEqual({type: exportFormats[i].type, graph: 'graph'});
                expect(modalInstance.open).not.toHaveBeenCalled();
            }
        });
        it('should open modal and call $scope.startDownload() on modal.close', function () {
            var exportFormats = [
                {type: 'application/rdf+xml'},
                {type: 'text/rdf+n3'},
                {type: 'text/plain'},
                {type: 'text/turtle'}
            ];
            var startDownload = {};
            $scope.startDownload = function (type, graph) {
                startDownload = {type: type, graph: 'graph'}
            }
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
            $scope.selectedGraphs = {exportGraphs: {'test': false}}
            modalInstance.openSimpleModal = jasmine.createSpy('modalInstance.openSimpleModal');
            $scope.exportSelectedGraphs({type: "application/x-trig"});
            expect(modalInstance.openSimpleModal).toHaveBeenCalled();

            $scope.selectedGraphs = {exportGraphs: {}}
            modalInstance.openSimpleModal = jasmine.createSpy('modalInstance.openSimpleModal');
            $scope.exportSelectedGraphs({type: "application/x-trig"});
            expect(modalInstance.openSimpleModal).toHaveBeenCalled();
        });

        it('should call $scope.downloadExport and not open modal', function () {
            $scope.getActiveRepository = function () {
                return 'activeRepository'
            }
            var exportFormats = [
                {type: 'application/rdf+json'},
                {type: 'application/ld+json'},
                {type: 'text/x-nquads'},
                {type: 'application/trix'},
                {type: 'application/x-trig'},
                {type: 'application/x-binary-rdf'}
            ]
            var downloadExport;
            $scope.downloadExport = function () {
                downloadExport = true;
            }
            modalInstance.openSimpleModal = jasmine.createSpy('modalInstance.openSimpleModal');
            for (var i = 0; i < exportFormats.length; i++) {
                downloadExport = false;
                $scope.selectedGraphs = {exportGraphs: {'test': true}}
                $scope.exportSelectedGraphs(exportFormats[i]);
                expect(modalInstance.openSimpleModal).not.toHaveBeenCalled();
                expect(downloadExport).toBeTruthy();
            }
        });

        it('should open modal and call $scope.downloadExport on modal.close', function () {
            $scope.getActiveRepository = function () {
                return 'activeRepository'
            }
            var exportFormats = [
                {type: 'application/rdf+xml'},
                {type: 'text/rdf+n3'},
                {type: 'text/plain'},
                {type: 'text/turtle'}
            ]
            var downloadExport;
            $scope.downloadExport = function () {
                downloadExport = true;
            }
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
