import "angular/core/services";
import 'angular/core/services/repositories.service';
import "angular/clustermanagement/app";
import "angular/clustermanagement/controllers/cluster-management.controller";
import "angular/clustermanagement/directives";

describe('==> Cluster management module controllers tests', function () {

    beforeEach(angular.mock.module('graphdb.framework.clustermanagement', function ($provide) {
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

            $httpBackend.when('GET', 'rest/security/all').respond(200, {
                enabled: false,
                freeAcesss: {enabled: false},
                overrideAuth: {enabled: false}
            });
            $httpBackend.when('GET', 'rest/locations/active').respond(200, {locationUri: ''});
            $httpBackend.when('GET', 'rest/security/users/admin').respond(200, {
                username: 'admin',
                appSettings: {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true},
                authorities: ['ROLE_ADMIN']
            });


            $httpBackend.when('GET', 'rest/cluster/config').respond(200, {
                "electionMinTimeout": 7000,
                "electionRangeTimeout": 5000,
                "heartbeatInterval": 2000,
                "messageSizeKB": 64,
                "verificationTimeout": 1500,
                "nodes": [
                    "yordan:7300",
                    "yordan:7304",
                    "yordan:7301",
                    "yordan:7302"
                ],
                "externalAddress": "yordan:7300",
                "initialStateChecksum": "7538297e440e81649170bf4f0e762b84459685e92d4bd14afe32b8ab3b51870d9902fc5ec13614774f931ff362ab8f98ab933dd4563093876fd241751a290ec6",
                "initialRepositories": []
            });
            $httpBackend.when('GET', 'rest/cluster/node/status').respond(200, {
                "address": "yordan:7300",
                "nodeState": "LEADER",
                "term": 2,
                "syncStatus": {
                    "yordan:7301": "IN_SYNC",
                    "yordan:7302": "IN_SYNC",
                    "yordan:7304": "IN_SYNC"
                },
                "lastLogTerm": 0,
                "lastLogIndex": 0,
                "endpoint": "http://yordan:7200"
            });
            $httpBackend.when('GET', 'rest/cluster/group/status').respond(200, [
                {
                    "address": "yordan:7300",
                    "nodeState": "LEADER",
                    "term": 2,
                    "syncStatus": {
                        "yordan:7301": "IN_SYNC",
                        "yordan:7302": "IN_SYNC",
                        "yordan:7304": "IN_SYNC"
                    },
                    "lastLogTerm": 0,
                    "lastLogIndex": 0,
                    "endpoint": "http://yordan:7200"
                },
                {
                    "address": "yordan:7301",
                    "nodeState": "FOLLOWER",
                    "term": 2,
                    "syncStatus": {},
                    "lastLogTerm": 0,
                    "lastLogIndex": 0,
                    "endpoint": "http://yordan:7201"
                },
                {
                    "address": "yordan:7302",
                    "nodeState": "FOLLOWER",
                    "term": 2,
                    "syncStatus": {},
                    "lastLogTerm": 0,
                    "lastLogIndex": 0,
                    "endpoint": "http://yordan:7202"
                },
                {
                    "address": "yordan:7304",
                    "nodeState": "FOLLOWER",
                    "term": 2,
                    "syncStatus": {},
                    "lastLogTerm": 0,
                    "lastLogIndex": 0,
                    "endpoint": "http://yordan:7204"
                }
            ]);
            $httpBackend.when('GET', 'rest/locations').respond(200, [
                {
                    "uri": "http://yordan:7205",
                    "label": "Remote (http://yordan:7205)",
                    "username": "",
                    "password": "",
                    "authType": "signature",
                    "active": false,
                    "local": false,
                    "system": false,
                    "errorMsg": null,
                    "defaultRepository": null
                },
                {
                    "uri": "http://yordan:7202",
                    "label": "Remote (http://yordan:7202)",
                    "username": "",
                    "password": "",
                    "authType": "signature",
                    "active": false,
                    "local": false,
                    "system": false,
                    "errorMsg": null,
                    "defaultRepository": null
                },
                {
                    "uri": "http://yordan:7204",
                    "label": "Remote (http://yordan:7204)",
                    "username": "",
                    "password": "",
                    "authType": "signature",
                    "active": false,
                    "local": false,
                    "system": false,
                    "errorMsg": null,
                    "defaultRepository": null
                },
                {
                    "uri": "",
                    "label": "Local",
                    "username": null,
                    "password": null,
                    "authType": "none",
                    "active": true,
                    "local": true,
                    "system": true,
                    "errorMsg": null,
                    "defaultRepository": null
                },
                {
                    "uri": "http://yordan:7203",
                    "label": "Remote (http://yordan:7203)",
                    "username": "",
                    "password": "",
                    "authType": "signature",
                    "active": false,
                    "local": false,
                    "system": false,
                    "errorMsg": null,
                    "defaultRepository": null
                },
                {
                    "uri": "http://yordan:7201",
                    "label": "Remote (http://yordan:7201)",
                    "username": "",
                    "password": "",
                    "authType": "signature",
                    "active": false,
                    "local": false,
                    "system": false,
                    "errorMsg": null,
                    "defaultRepository": null
                }
            ]);

            $httpBackend.when('GET', 'rest/info/rpc-address?location=http:%2F%2Fyordan:7201').respond(200, 'yordan:7201');
            $httpBackend.when('GET', 'rest/info/rpc-address?location=http:%2F%2Fyordan:7202').respond(200, 'yordan:7202');
            $httpBackend.when('GET', 'rest/info/rpc-address?location=http:%2F%2Fyordan:7203').respond(200, 'yordan:7203');
            $httpBackend.when('GET', 'rest/info/rpc-address?location=http:%2F%2Fyordan:7204').respond(200, 'yordan:7204');
            $httpBackend.when('GET', 'rest/info/rpc-address?location=http:%2F%2Fyordan:7205').respond(200, 'yordan:7205');
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        describe('Get cluster info', function () {
            it('Should get cluster configuration $scope.getClusterConfiguration', function () {
                $httpBackend.flush();
                $httpBackend.expectGET('rest/cluster/config');

                $scope.getClusterConfiguration();
                $httpBackend.flush();

                expect($scope.clusterConfiguration).toBeDefined();
                expect($scope.clusterConfiguration.nodes.length).toEqual(4);
            });

            it('$scope.getCurrentNodeStatus()', function () {
                $httpBackend.flush();
                $httpBackend.expectGET('rest/cluster/node/status');

                $scope.getCurrentNodeStatus();
                $httpBackend.flush();

                expect($scope.currentNode).toBeDefined();
                expect($scope.currentNode.address).toEqual('yordan:7300');
            });
        });
    });
});
