import "angular/core/services";
import 'angular/core/services/repositories.service';
import "angular/clustermanagement/app";
import "angular/clustermanagement/controllers";
import "angular/clustermanagement/directives";

describe('==> Repository module controllers tests', function () {

    beforeEach(angular.mock.module('graphdb.framework.clustermanagement.controllers', function ($provide) {
        $provide.constant("productInfo", {
            "productType": "standard", "productVersion": "7.0", "sesame": "2.9.0", "connectors": "5.0.0"
        });
    }));

    describe('=> ClusterManagementCtrl tests', function () {
        var $httpBackend,
            $location,
            $controller,
            $timeout,
            $scope,
            $window,
            httpGetCluster,
            httpGetMaster,
            toastr;

        beforeEach(angular.mock.inject(function (_$controller_, _$httpBackend_, _toastr_, _$location_, _$window_, _$timeout_, $rootScope) {
            $httpBackend = _$httpBackend_;
            $location = _$location_;
            $controller = _$controller_;
            $window = _$window_;
            $timeout = _$timeout_;
            toastr = _toastr_;
            $scope = $rootScope.$new();

            $scope.height = function () {
                return 600;
            };
            $scope.width = function () {
                return 1000;
            };

            $controller('ClusterManagementCtrl', {
                $scope: $scope,
                ModalService: {
                    openSimpleModal: function () {
                        return this;
                    }
                }
            });

            httpGetCluster = $httpBackend.when('GET', 'rest/repositories/cluster').respond(200, [
                {
                    id: "SYSTEM",
                    local: true,
                    location: "C:\temp\ee\location",
                    readable: true,
                    sesameType: "openrdf:SystemRepository",
                    title: "System configuration repository",
                    type: "system",
                    uri: "http://localhost:8080/graphdb-workbench/repositories/SYSTEM",
                    writable: true
                },
                {
                    id: "worker",
                    local: true,
                    location: "C:\temp\ee\location",
                    readable: true,
                    sesameType: "owlim:ReplicationClusterWorker",
                    title: "",
                    type: "worker",
                    uri: "http://localhost:8080/graphdb-workbench/repositories/rest",
                    writable: true
                },
                {
                    id: "master",
                    local: true,
                    location: "C:\temp\ee\location",
                    readable: true,
                    sesameType: "owlim:ReplicationCluster",
                    title: "",
                    type: "master",
                    uri: "http://localhost:8080/graphdb-workbench/repositories/master",
                    writable: true,
                }]);
            httpGetMaster = $httpBackend.when('GET', 'rest/cluster/masters/master?masterLocation=local').respond(200,
                {
                    averageReadTime: 0,
                    completedReads: 5,
                    completedWrites: 0,
                    failedReads: 0,
                    failedWrites: 0,
                    isLocal: true,
                    local: true,
                    location: "http://localhost:8080/graphdb-workbench/repositories/master",
                    nodeID: "http://192.168.129.91:8080/graphdb-workbench/repositories/master",
                    peers: [],
                    pendingWrites: 0,
                    runningReads: 0,
                    runningWrites: 0,
                    type: "master",
                    workers: []
                });
            $httpBackend.when('GET', 'rest/security/all').respond(200, {
                enabled: false,
                freeAcesss: {enabled: false},
                overrideAuth: {enabled: false}
            });
            $httpBackend.when('GET', 'rest/locations/active').respond(200, {locationUri: ''});
            $httpBackend.when('GET', 'rest/security/user/admin').respond(200, {
                username: 'admin',
                appSettings: {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true},
                authorities: ['ROLE_ADMIN']
            });
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        describe('getMaster', () => {
            it('should load info for the master', () => {
                $httpBackend.expectGET('rest/cluster/masters/masterRepositoryID').respond(200, {
                    masterInfo: 'masterInformation'
                });

                $scope.getMaster('masterRepositoryID');
                $httpBackend.flush();

                expect($scope.masterInformation).toEqual({masterInfo: 'masterInformation'});
            });

            it('should not set master info if load fails', () => {
                $httpBackend.expectGET('rest/cluster/masters/masterRepositoryID').respond(500, {
                    message: 'Master info load error!'
                });

                $scope.getMaster('masterRepositoryID');
                $httpBackend.flush();

                expect($scope.masterInformation).toBeUndefined();
            });
        });

        describe('setMasterAttribute', () => {
            it('should configure master', () => {
                $scope.refreshMastersIcons = jasmine.createSpy();
                spyOn(toastr, 'success');
                $httpBackend.expectPOST('rest/cluster/masters/location?masterLocation=http%3A%2F%2Fmasterlocation').respond(200);

                $scope.setMasterAttribute({ location: 'http://masterlocation'}, 'attr1', 'value1');
                $httpBackend.flush();
                $timeout.flush();

                expect($scope.attributeChange).toEqual(false);
                expect(toastr.success).toHaveBeenCalledWith('Set attr1 to value1.', '');
                expect($scope.refreshMastersIcons).toHaveBeenCalled();
                expect($scope.loader).toEqual(false);
            });

            it('should show notification if configuring fails', () => {
                $scope.refreshMastersIcons = jasmine.createSpy();
                spyOn(toastr, 'error');
                $httpBackend.expectPOST('rest/cluster/masters/location?masterLocation=http%3A%2F%2Fmasterlocation').respond(500, {
                    message: 'Configuring master error!'
                });

                $scope.setMasterAttribute({location: 'http://masterlocation'}, 'attr1', 'value1');
                $httpBackend.flush();
                $timeout.flush();

                expect($scope.attributeChange).toEqual(false);
                expect(toastr.error).toHaveBeenCalledWith('Configuring master error!', 'Error setting attribute attr1');
            });
        });

        describe('cloneCurrentRepository', () => {
            it('should clone repository', () => {
                $scope.selectedNode = {
                    local: 'http://masterlocation'
                };
                $scope.clone = {
                    repositoryId: 'repoId',
                    location: {uri: 'http://targetlocation'}
                };
                spyOn(toastr, 'success');
                spyOn($scope, 'getNodes');
                $httpBackend.expectPOST('rest/cluster/nodes/clone').respond(200);

                $scope.cloneCurrentRepository();
                $httpBackend.flush();
                $timeout.flush();

                expect(toastr.success).toHaveBeenCalled();
                expect($scope.getNodes).toHaveBeenCalled();
                expect($scope.loader).toEqual(false);
            });

            it('should show notification if clone fails', () => {
                $scope.selectedNode = {
                    local: 'http://masterlocation'
                };
                $scope.clone = {
                    repositoryId: 'repoId',
                    location: {uri: 'http://targetlocation'}
                };
                spyOn(toastr, 'error');
                $httpBackend.expectPOST('rest/cluster/nodes/clone').respond(500, {
                    message: 'Clone repository error!'
                });

                $scope.cloneCurrentRepository();
                $httpBackend.flush();
                $timeout.flush();

                expect(toastr.error).toHaveBeenCalledWith('Clone repository error!', 'Error cloning node');
                expect($scope.loader).toEqual(false);
            });
        });

        describe('$scope.hasInfo()', function () {
            it('should return true when node is undefined', function () {
                $httpBackend.flush();
                expect($scope.hasInfo(undefined)).toBeTruthy();
            });

            it('should return correct data when node is worker', function () {
                $httpBackend.flush();
                $scope.isWorker = function () {
                    return true
                };
                expect($scope.hasInfo({})).toBeFalsy();
                expect($scope.hasInfo({fingerprint: 'something'})).toBeTruthy();

                $scope.isWorker = function () {
                    return false
                };
                expect($scope.hasInfo({})).toBeFalsy();
                expect($scope.hasInfo({failedReads: 'something'})).toBeTruthy();
            })
        });

        describe('$scope.isWorker()', function () {
            it('should return correct value', function () {
                $httpBackend.flush();
                expect($scope.isWorker()).toBeFalsy();
                expect($scope.isWorker(undefined)).toBeFalsy();
                expect($scope.isWorker(null)).toBeFalsy();
                expect($scope.isWorker({repositoryType: 'notWorker'})).toBeFalsy();
                expect($scope.isWorker({repositoryType: 'worker'})).toBeTruthy();
            })
        });

        describe('$scope.selectNode()', function () {
            it('should return correct value and call $scope.$apply()', function () {
                $httpBackend.flush();
                var apply = false;
                $scope.$apply = function () {
                    apply = true;
                };
                $scope.selectNode();
                expect($scope.selectedNode).toBeUndefined();
                expect(apply).toBeTruthy();

                apply = false;
                var node = {
                    name: "master",
                    local: true,
                    location: "http://localhost:8080/graphdb-workbench/repositories/master",
                    repositoryType: "master"
                };
                $scope.selectNode(node);
                expect($scope.selectedNode).toEqual({
                    name: "master",
                    local: true,
                    location: "http://localhost:8080/graphdb-workbench/repositories/master",
                    repositoryType: "master"
                });
                expect(apply).toBeTruthy();

                apply = false;
                $scope.selectNode(node);
                expect($scope.selectedNode).toBeNull();
                expect(apply).toBeTruthy();
            })
        });

        describe('$scope.getLabel()', function () {
            it('should return correct url', function () {
                $httpBackend.flush();
                expect($scope.getLabel("http://localhost:8080/graphdb-workbench/repositories/master")).toEqual('master');
            });
        });

        describe(' $scope.addOrUpdateLink()', function () {
            it('should return correct data, and set correct linksHash, links and needsToRestart', function () {
                $httpBackend.flush();
                var source = {
                        averageTaskTime: 28,
                        cluster: 0,
                        completedTasks: 1,
                        failedTasks: 0,
                        fingerprint: "fingerprint",
                        index: 0,
                        local: true,
                        location: "http://localhost:8080/graphdb-workbench/repositories/worker",
                        name: "worker",
                        px: 802.5908073757943,
                        py: 281.83316831495597,
                        repositoryType: "worker",
                        runningTasks: 0,
                        timestamp: 1441268006976,
                        weight: 0,
                        x: 802.7558399129224,
                        y: 281.79214922606917
                    },
                    target = {
                        averageReadTime: 0,
                        cluster: 0,
                        completedReads: 10,
                        completedWrites: 0,
                        failedReads: 0,
                        failedWrites: 0,
                        index: 1,
                        local: true,
                        location: "http://localhost:8080/graphdb-workbench/repositories/master",
                        name: "master",
                        nodeID: "http://192.168.129.91:8080/graphdb-workbench/repositories/master",
                        peers: {},
                        pendingWrites: 0,
                        px: 656.4091926242065,
                        py: 318.1668316850433,
                        repositoryType: "master",
                        runningReads: 0,
                        runningWrites: 0,
                        timestamp: 1441268008975,
                        weight: 0,
                        x: 656.2441600870786,
                        y: 318.2078507739301
                    },
                    status = '',
                    timestamp = Date.now();

                expect($scope.addOrUpdateLink(source, target, status, timestamp)).toEqual({
                    source: source,
                    target: target,
                    status: status,
                    timestamp: timestamp,
                    reversePeerMissing: false
                });
                expect($scope.linksHash[source.location + '|' + target.location]).toEqual({
                    source: source,
                    target: target,
                    status: '',
                    timestamp: timestamp,
                    reversePeerMissing: false
                });
                expect($scope.links).toEqual([{
                    source: source,
                    target: target,
                    status: '',
                    timestamp: timestamp,
                    reversePeerMissing: false
                }]);
                expect($scope.needsToRestart).toBeTruthy();

                $scope.needsToRestart = false;
                $scope.addOrUpdateLink(source, target, 'ON', timestamp);
                expect($scope.needsToRestart).toBeFalsy();

            })
        })
    });
});
