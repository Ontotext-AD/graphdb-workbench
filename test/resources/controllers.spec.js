import "angular/core/services";
import 'angular/core/services/repositories.service';
import "angular/resources/controllers";
import {bundle} from "../test-main";

const mocks = angular.module('MocksForResourceMonitor', [
    'graphdb.framework.utils.workbenchsettingsstorageservice',
    'graphdb.framework.core.services.theme-service']);
mocks.service('$repositories', function () {
    this.getActiveRepository = function () {
        return 'activeRepository';
    };
});

mocks.service('ThemeService', function () {
    this.getThemeDefinition = function () {
        return {
            variables: {
                "secondary-color-hue": "207.3",
                "secondary-color-saturation": "100%",
                "secondary-color-lightness": "19.4%",
            }
        };
    };
});

beforeEach(angular.mock.module('graphdb.framework.jmx.resources.controllers', function ($provide) {
    $provide.constant("productInfo", {
        "productType": "standard", "productVersion": "7.0", "sesame": "2.9.0", "connectors": "5.0.0"
    });
}));

describe('=> ResourcesCtrl tests', function () {
    var $httpBackend,
        $controller,
        $timeout,
        $scope,
        $repositories,
        MonitoringRestService,
        $jwtAuth,
        httpGetResourcesData,
        ThemeService;
        let $translate;

    beforeEach(angular.mock.module('MocksForResourceMonitor'));

    beforeEach(angular.mock.inject(function (_$httpBackend_, _$repositories_, _$location_, _$controller_, _$window_, _$timeout_, $rootScope, _$translate_, _MonitoringRestService_, _$jwtAuth_, _ThemeService_) {

        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        $timeout = _$timeout_;
        $repositories = _$repositories_;
        $translate = _$translate_;
        MonitoringRestService = _MonitoringRestService_;
        $jwtAuth = _$jwtAuth_;
        ThemeService = _ThemeService_;

        $translate.instant = function (key, modification) {
            if (modification) {
                let modKey = Object.keys(modification)[0];
                return bundle[key].replace(`{{${modKey}}}`, modification[modKey]);
            }
            return bundle[key];
        };

        httpGetResourcesData = $httpBackend.when('GET', 'rest/monitor/infrastructure').respond(200, {
            "heapMemoryUsage": {
                "max": 1888485376,
                "committed": 703594496,
                "init": 134217728,
                "used": 212264560,
                "free": 16609443840
            },
            "nonHeapMemoryUsage": {
                "max": -1,
                "committed": 124477440,
                "init": 2555904,
                "used": 122066392,
                "free": -183684985
            },
            "storageMemory": {
                "dataDirUsed": 174259171328,
                "workDirUsed": 174259171328,
                "logsDirUsed": 174259171328,
                "dataDirFree": 7743021056,
                "workDirFree": 7743021056,
                "logsDirFree": 7743021056
            },
            "threadCount": 20,
            "cpuLoad": 19.695456009969313,
            "classCount": 13173,
            "gcCount": 15,
            "openFileDescriptors": 550
        });
        $httpBackend.when('GET', 'rest/monitor/structures').respond(200, {
            "cacheHit": 5759,
            "cacheMiss": 558
        });
        $httpBackend.when('GET', 'rest/monitor/repository/activeRepository').respond(200, {
            "queries": {
                "slow": 0,
                "suboptimal": 0
            },
            "entityPool": {
                "epoolReads": 10504,
                "epoolWrites": 122,
                "epoolSize": 75
            },
            "activeTransactions": 0,
            "openConnections": 0
        });
        $httpBackend.when('GET', 'rest/monitor/repository/activeRepository/query/active').respond(200, []);
        $httpBackend.when('GET', 'rest/monitor/cluster').respond(200, {
            "term": 4,
            "failureRecoveriesCount": 0,
            "failedTransactionsCount": 0,
            "nodesStats": {
                "nodesInCluster": 3,
                "nodesInSync": 3,
                "nodesOutOfSync": 0,
                "nodesDisconnected": 0,
                "nodesSyncing": 0
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

        $httpBackend.when('GET', 'rest/locations').respond(200, {});
        $httpBackend.when('GET', 'rest/locations').respond(200, {});

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

        $scope = $rootScope.$new();
        $controller('ResourcesCtrl', {$scope: $scope, $timeout, MonitoringRestService, $translate, $repositories, $jwtAuth, ThemeService});

        jasmine.clock().install();
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();

        jasmine.clock().uninstall();
    });

    describe('Test resource data fetch and set', function () {
        it('should call resource monitor function on every 2s', function () {
            $httpBackend.expectGET('rest/monitor/infrastructure');

            expect($httpBackend.flush).not.toThrow();
            $timeout.flush(2000);
            expect($httpBackend.flush).not.toThrow();
            $timeout.flush(2000);
            expect($httpBackend.flush).not.toThrow();
        });

        it('should call performance monitor function on every 2s', function () {
            $httpBackend.expectGET('rest/monitor/structures');
            $httpBackend.expectGET('rest/monitor/repository/activeRepository');
            $httpBackend.expectGET('rest/monitor/repository/activeRepository/query/active');

            expect($httpBackend.flush).not.toThrow();
            $timeout.flush(2000);
            expect($httpBackend.flush).not.toThrow();
            $timeout.flush(2000);
            expect($httpBackend.flush).not.toThrow();
        });

        it('should call cluster health monitor function on every 2s', function () {
            $httpBackend.expectGET('rest/monitor/cluster');

            expect($httpBackend.flush).not.toThrow();
            $timeout.flush(2000);
            expect($httpBackend.flush).not.toThrow();
            $timeout.flush(2000);
            expect($httpBackend.flush).not.toThrow();
        });

        it('should set resource monitor charts data correct', function () {
            $httpBackend.expectGET('rest/monitor/infrastructure');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();

            $timeout.flush(2001);
            $httpBackend.flush();
            var joc = jasmine.objectContaining;

            expect($scope.resourceMonitorData.charts.cpuLoad.dataHolder).toEqual([joc({
                name: "System CPU load",
                data: [{value: [today, 19.6955]}]
            })])
            expect($scope.resourceMonitorData.charts.fileDescriptors.dataHolder).toEqual([joc({
                name: "Open file descriptors",
                areaStyle: {},
                data: [{value: [today, 550]}]
            })])
            expect($scope.resourceMonitorData.charts.heapMemory.dataHolder).toEqual([joc({
                name: "Committed memory",
                data: [{value: [today, 703594496]}]
            }), joc({name: 'Used memory', areaStyle: {}, data: [{value: [today, 212264560]}]})])
            expect($scope.resourceMonitorData.charts.offHeapMemory.dataHolder).toEqual([joc({
                name: "Committed memory",
                data: [{value: [today, 124477440]}]
            }), joc({name: 'Used memory', areaStyle: {}, data: [{value: [today, 122066392]}]})])
            expect($scope.resourceMonitorData.charts.diskStorage.dataHolder).toEqual([joc({
                name: "Used",
                color: '#E84E0F',
                data: [0.9574564407462561, 0.9574564407462561, 0.9574564407462561]
            }), joc({
                name: 'Free',
                color: '#003663',
                data: [0.042543559253743896, 0.042543559253743896, 0.042543559253743896]
            })])
            $timeout.flush(2000);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.charts.cpuLoad.dataHolder).toEqual([joc({
                name: "System CPU load",
                data: [{value: [today, 19.6955]}, {value: [today, 19.6955]}]
            })])
            expect($scope.resourceMonitorData.charts.fileDescriptors.dataHolder).toEqual([joc({
                name: "Open file descriptors",
                areaStyle: {},
                data: [{value: [today, 550]}, {value: [today, 550]}]
            })])
            expect($scope.resourceMonitorData.charts.heapMemory.dataHolder).toEqual([joc({
                name: "Committed memory",
                data: [{value: [today, 703594496]}, {value: [today, 703594496]}]
            }), joc({name: 'Used memory', areaStyle: {}, data: [{value: [today, 212264560]}, {value: [today, 212264560]}]})])
            expect($scope.resourceMonitorData.charts.offHeapMemory.dataHolder).toEqual([joc({
                name: "Committed memory",
                data: [{value: [today, 124477440]}, {value: [today, 124477440]}]
            }), joc({name: 'Used memory', areaStyle: {}, data: [{value: [today, 122066392]}, {value: [today, 122066392]}]})])
            expect($scope.resourceMonitorData.charts.diskStorage.dataHolder).toEqual([joc({
                name: "Used",
                color: '#E84E0F',
                data: [0.9574564407462561, 0.9574564407462561, 0.9574564407462561, 0.9574564407462561, 0.9574564407462561, 0.9574564407462561]
            }), joc({
                name: 'Free',
                color: '#003663',
                data: [0.042543559253743896, 0.042543559253743896, 0.042543559253743896, 0.042543559253743896, 0.042543559253743896, 0.042543559253743896]
            })])
        });

        it('should set performance monitor charts data correct', function () {
            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();
            var joc = jasmine.objectContaining;

            $httpBackend.flush();
            expect($scope.performanceMonitorData.charts.connectionsChart.dataHolder).toEqual([
                joc({
                    name: "Active transactions",
                    data: [{value: [today, 0]}]
                }),
                joc({
                    name: "Open connections",
                    data: [{value: [today, 0]}]
                })
            ]);
            expect($scope.performanceMonitorData.charts.epoolChart.dataHolder).toEqual([
                joc({
                    name: "Reads",
                    data: [{value: [today, 0]}]
                }),
                joc({
                    name: "Writes",
                    data: [{value: [today, 0]}]
                })
            ]);
            expect($scope.performanceMonitorData.charts.queriesChart.dataHolder).toEqual([
                joc({
                    name: "Running queries",
                    data: [{value: [today, 0]}]
                })
            ]);
            expect($scope.structuresMonitorData.charts.globalCacheChart.dataHolder).toEqual([
                joc({
                    name: "Hit",
                    data: [{value: [today, 5759]}]
                }),
                joc({
                    name: "Miss",
                    data: [{value: [today, 558]}]
                })
            ]);
            $timeout.flush(2001);
            $httpBackend.flush();

            expect($scope.performanceMonitorData.charts.connectionsChart.dataHolder).toEqual([
                joc({
                    name: "Active transactions",
                    data: [{value: [today, 0]}, {value: [today, 0]}]
                }),
                joc({
                    name: "Open connections",
                    data: [{value: [today, 0]}, {value: [today, 0]}]
                })
            ]);

            expect($scope.performanceMonitorData.charts.epoolChart.dataHolder).toEqual([
                joc({
                    name: "Reads",
                    data: [{value: [today, 0]}, {value: [today, 0]}]
                }),
                joc({
                    name: "Writes",
                    data: [{value: [today, 0]}, {value: [today, 0]}]
                })
            ]);
            expect($scope.performanceMonitorData.charts.queriesChart.dataHolder).toEqual([
                joc({
                    name: "Running queries",
                    data: [{value: [today, 0]}, {value: [today, 0]}]
                })
            ]);
            expect($scope.structuresMonitorData.charts.globalCacheChart.dataHolder).toEqual([
                joc({
                    name: "Hit",
                    data: [{value: [today, 5759]}, {value: [today, 5759]}]
                }),
                joc({
                    name: "Miss",
                    data: [{value: [today, 558]}, {value: [today, 558]}]
                })
            ]);
        });

        it('should set cluster health monitor charts data correct', function () {
            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();
            var joc = jasmine.objectContaining;

            $httpBackend.flush();
            expect($scope.clusterHealthData.charts.clusterHealthChart.dataHolder).toEqual([
                joc({name: 'In sync', color: '#003663', data: [{value: [today, 3]}]}),
                joc({name: 'Syncing', color: '#02A99A', data: [{value: [today, 0]}]}),
                joc({name: 'Out of sync', color: '#E84E0F', data: [{value: [today, 0]}]}),
                joc({name: 'Disconnected', color: '#999999', data: [{value: [today, 0]}]})
            ]);
            $timeout.flush(2001);
            $httpBackend.flush();

            expect($scope.clusterHealthData.charts.clusterHealthChart.dataHolder).toEqual([
                joc({name: 'In sync', color: '#003663', data: [{value: [today, 3]}, {value: [today, 3]}]}),
                joc({name: 'Syncing', color: '#02A99A', data: [{value: [today, 0]}, {value: [today, 0]}]}),
                joc({name: 'Out of sync', color: '#E84E0F', data: [{value: [today, 0]}, {value: [today, 0]}]}),
                joc({name: 'Disconnected', color: '#999999', data: [{value: [today, 0]}, {value: [today, 0]}]})
            ]);
        });

        it('should set cpuLoad yDomain to 0, 100 if the current value is above 50', function () {
            $httpBackend.expectGET('rest/monitor/infrastructure');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();
            var joc = jasmine.objectContaining;

            $timeout.flush(2001);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.charts.cpuLoad.dataHolder).toEqual([
                joc({
                    name: "System CPU load",
                    data: [{value: [today, 19.6955]}]
                })]);
            expect($scope.resourceMonitorData.charts.cpuLoad.chartOptions.yAxis.max({max: 19.6955})).toEqual(39)

            httpGetResourcesData.respond(200, {
                "heapMemoryUsage": {
                    "max": 1888485376,
                    "committed": 703594496,
                    "init": 134217728,
                    "used": 212264560,
                    "free": 16609443840
                },
                "nonHeapMemoryUsage": {
                    "max": -1,
                    "committed": 124477440,
                    "init": 2555904,
                    "used": 122066392,
                    "free": -183684985
                },
                "storageMemory": {
                    "dataDirUsed": 174259171328,
                    "workDirUsed": 174259171328,
                    "logsDirUsed": 174259171328,
                    "dataDirFree": 7743021056,
                    "workDirFree": 7743021056,
                    "logsDirFree": 7743021056
                },
                "threadCount": 20,
                "cpuLoad": 51.6955,
                "classCount": 13173,
                "gcCount": 15,
                "openFileDescriptors": 550
            });


            $timeout.flush(2000);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.charts.cpuLoad.dataHolder).toEqual([
                joc({
                    name: "System CPU load",
                    data: [{value: [today, 19.6955]}, {value: [today, 51.6955]}]
                })
            ]);
            expect($scope.resourceMonitorData.charts.cpuLoad.chartOptions.yAxis.max({max: 51.6955})).toEqual(100);
        });

        it('should set file descriptors yDomain to 0, max*2', function () {
            $httpBackend.expectGET('rest/monitor/infrastructure');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();
            var joc = jasmine.objectContaining;

            $timeout.flush(2001);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.charts.fileDescriptors.dataHolder).toEqual([
                joc({
                    name: "Open file descriptors",
                    data: [{value: [today, 550]}]
                })]);
            expect($scope.resourceMonitorData.charts.fileDescriptors.chartOptions.yAxis.max).toEqual(1100)

            httpGetResourcesData.respond(200, {
                "heapMemoryUsage": {
                    "max": 1888485376,
                    "committed": 703594496,
                    "init": 134217728,
                    "used": 212264560,
                    "free": 16609443840
                },
                "nonHeapMemoryUsage": {
                    "max": -1,
                    "committed": 124477440,
                    "init": 2555904,
                    "used": 122066392,
                    "free": -183684985
                },
                "storageMemory": {
                    "dataDirUsed": 174259171328,
                    "workDirUsed": 174259171328,
                    "logsDirUsed": 174259171328,
                    "dataDirFree": 7743021056,
                    "workDirFree": 7743021056,
                    "logsDirFree": 7743021056
                },
                "threadCount": 20,
                "cpuLoad": 51.6955,
                "classCount": 13173,
                "gcCount": 15,
                "openFileDescriptors": 600
            });


            $timeout.flush(2000);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.charts.fileDescriptors.chartOptions.yAxis.max).toEqual(1200);
        })

        it('should set heap memory yDomain to 0, max*1.2', function () {
            $httpBackend.expectGET('rest/monitor/infrastructure');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();
            var joc = jasmine.objectContaining;

            $timeout.flush(2001);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.charts.heapMemory.dataHolder).toEqual([
                joc({
                    name: "Committed memory",
                    data: [{value: [today, 703594496]}]
                    }),
                joc({
                    name: "Used memory",
                    data: [{value: [today, 212264560]}]
                })
            ])
            expect($scope.resourceMonitorData.charts.heapMemory.chartOptions.yAxis.max).toEqual(Math.ceil(703594496*1.2));

            httpGetResourcesData.respond(200, {
                "heapMemoryUsage": {
                    "max": 1888485376,
                    "committed": 783594496,
                    "init": 134217728,
                    "used": 212264560,
                    "free": 16609443840
                },
                "nonHeapMemoryUsage": {
                    "max": -1,
                    "committed": 124477440,
                    "init": 2555904,
                    "used": 122066392,
                    "free": -183684985
                },
                "storageMemory": {
                    "dataDirUsed": 174259171328,
                    "workDirUsed": 174259171328,
                    "logsDirUsed": 174259171328,
                    "dataDirFree": 7743021056,
                    "workDirFree": 7743021056,
                    "logsDirFree": 7743021056
                },
                "threadCount": 20,
                "cpuLoad": 51.6955,
                "classCount": 13173,
                "gcCount": 15,
                "openFileDescriptors": 600
            });


            $timeout.flush(2000);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.charts.heapMemory.chartOptions.yAxis.max).toEqual(Math.ceil(783594496*1.2));
        })

        it('should set non-heap memory yDomain to 0, max*1.2', function () {
            $httpBackend.expectGET('rest/monitor/infrastructure');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();
            var joc = jasmine.objectContaining;

            $timeout.flush(2001);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.charts.offHeapMemory.dataHolder).toEqual([
                joc({
                    name: "Committed memory",
                    data: [{value: [today, 124477440]}]
                }),
                joc({
                    name: "Used memory",
                    data: [{value: [today, 122066392]}]
                })
            ]);
            expect($scope.resourceMonitorData.charts.offHeapMemory.chartOptions.yAxis.max).toEqual(124477440 * 1.2)

            httpGetResourcesData.respond(200, {
                "heapMemoryUsage": {
                    "max": 1888485376,
                    "committed": 783594496,
                    "init": 134217728,
                    "used": 212264560,
                    "free": 16609443840
                },
                "nonHeapMemoryUsage": {
                    "max": -1,
                    "committed": 164477440,
                    "init": 2555904,
                    "used": 122066392,
                    "free": -183684985
                },
                "storageMemory": {
                    "dataDirUsed": 174259171328,
                    "workDirUsed": 174259171328,
                    "logsDirUsed": 174259171328,
                    "dataDirFree": 7743021056,
                    "workDirFree": 7743021056,
                    "logsDirFree": 7743021056
                },
                "threadCount": 20,
                "cpuLoad": 51.6955,
                "classCount": 13173,
                "gcCount": 15,
                "openFileDescriptors": 600
            });


            $timeout.flush(2000);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.charts.offHeapMemory.chartOptions.yAxis.max).toEqual(164477440*1.2)
        })
    });

    describe('Test chart options', function () {
        it('should return correct data for Y axis', function () {
            httpGetResourcesData.respond(200, {
                "heapMemoryUsage": {
                    "max": 1888485376,
                    "committed": 8589934592,
                    "init": 134217728,
                    "used": 212264560,
                    "free": 16609443840
                },
                "nonHeapMemoryUsage": {
                    "max": -1,
                    "committed": 164477440,
                    "init": 2555904,
                    "used": 122066392,
                    "free": -183684985
                },
                "storageMemory": {
                    "dataDirUsed": 174259171328,
                    "workDirUsed": 174259171328,
                    "logsDirUsed": 174259171328,
                    "dataDirFree": 7743021056,
                    "workDirFree": 7743021056,
                    "logsDirFree": 7743021056
                },
                "threadCount": 20,
                "cpuLoad": 51.6955,
                "classCount": 13173,
                "gcCount": 15,
                "openFileDescriptors": 600
            });

            $httpBackend.expectGET('rest/monitor/infrastructure');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);

            $timeout.flush(2001);
            $httpBackend.flush();

            expect($scope.resourceMonitorData.charts.cpuLoad.chartOptions.yAxis.axisLabel.formatter(123)).toEqual('123%');
            expect($scope.resourceMonitorData.charts.fileDescriptors.chartOptions.yAxis.axisLabel.formatter(50)).toEqual('50');
            expect($scope.resourceMonitorData.charts.heapMemory.chartOptions.yAxis.axisLabel.formatter(8589934592)).toEqual('8.00 GB');
            expect($scope.resourceMonitorData.charts.offHeapMemory.chartOptions.yAxis.axisLabel.formatter(265289728)).toEqual('253.00 MB');
            expect($scope.resourceMonitorData.charts.diskStorage.chartOptions.xAxis.axisLabel.formatter(0.5)).toEqual('50.00%');
        });
    });

});
