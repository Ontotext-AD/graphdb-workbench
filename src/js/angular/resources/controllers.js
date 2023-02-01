import 'angular/core/services';
import 'angular/core/services/repositories.service';
import 'angular/rest/monitoring.rest.service';
import 'lib/nvd3/nv.d3';
import {FileDescriptorsChart} from './chart-models/resource/file-descriptors-chart';
import {HeapMemoryChart} from './chart-models/resource/heap-memory-chart';
import {NonHeapMemoryChart} from './chart-models/resource/non-heap-memory-chart';
import {CpuLoadChart} from './chart-models/resource/cpu-load-chart';
import {DiskStorageChart} from './chart-models/resource/disk-storage-chart';
import {QueriesChart} from './chart-models/performance/queries-chart';
import {GlobalCacheChart} from './chart-models/resource/global-cache-chart';
import {ConnectionsChart} from './chart-models/performance/connections-chart';
import {EpoolChart} from './chart-models/performance/epool-chart';

const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.rest.monitoring.service'
];

const resourcesCtrl = angular.module('graphdb.framework.jmx.resources.controllers', modules);

resourcesCtrl.controller('ResourcesCtrl', ['$scope', '$timeout', 'MonitoringRestService', '$translate', '$repositories', '$jwtAuth', '$q',
    function ($scope, $timeout, MonitoringRestService, $translate, $repositories, $jwtAuth, $q) {
        const POLLING_INTERVAL = 2000;
        const chartOptions = {
            chart: {
                interpolate: 'monotone',
                type: 'lineChart',
                height: 500,
                margin: {
                    left: 100
                },
                x: function (d) {
                    return d[0];
                },
                y: function (d) {
                    return d[1];
                },
                clipEdge: true,
                noData: $translate.instant('resource.no_data'),
                showControls: true,
                rightAlignYAxis: false,
                useInteractiveGuideline: true,
                xAxis: {
                    showMaxMin: false,
                    tickFormat: function (d) {
                        return d3.time.format('%X')(new Date(d));
                    }
                },
                yAxis: {
                    showMaxMin: false,
                    tickFormat: function (d) {
                        return d;
                    }
                }
            }
        };
        $scope.resourceMonitorData = {
            cpuLoad: new CpuLoadChart($translate, angular.copy(chartOptions)),
            fileDescriptors: new FileDescriptorsChart($translate, angular.copy(chartOptions)),
            heapMemory: new HeapMemoryChart($translate, angular.copy(chartOptions)),
            offHeapMemory: new NonHeapMemoryChart($translate, angular.copy(chartOptions)),
            diskStorage: new DiskStorageChart($translate, angular.copy(chartOptions))
        };

        $scope.performanceMonitorData = {
            connectionsChart: new ConnectionsChart($translate, angular.copy(chartOptions)),
            epoolChart: new EpoolChart($translate, angular.copy(chartOptions))
        };

        $scope.queriesChart = new QueriesChart($translate, angular.copy(chartOptions));

        $scope.structuresMonitorData = {
            globalCacheChart: new GlobalCacheChart($translate, angular.copy(chartOptions))
        };

        let firstLoad = true;

        $scope.activeTab = 'resourceMonitor';
        $scope.error = '';
        $scope.loader = true;

        $scope.isAdmin = $jwtAuth.isAdmin();
        $scope.isRepoManager = $jwtAuth.isRepoManager();

        $scope.switchTab = (tab) => {
            $scope.activeTab = tab;
        };

        $scope.getActiveRepository = function () {
            return $repositories.getActiveRepository();
        };

        let resourceMonitorPoll;
        const getResourceMonitorData = function () {
            if ($scope.error) {
                return;
            }
            MonitoringRestService.monitorResources().then(function (response) {
                const data = response.data;
                if (data) {
                    const timestamp = new Date();

                    Object.values($scope.resourceMonitorData).forEach((chart) => {
                        chart.addData(timestamp, data);
                    });

                    if (firstLoad) {
                        firstLoad = false;

                        const timer = $timeout(function () {
                            $scope.loader = false;
                        }, 500);

                        $scope.$on('$destroy', function () {
                            $timeout.cancel(timer);
                        });
                    }
                }
                resourceMonitorPoll = $timeout(getResourceMonitorData, POLLING_INTERVAL);
            }).catch(function (error) {
                $scope.error = getError(error.data);
                $scope.loader = false;
            });
        };
        let queryMonitorData;

        const getQueryMonitor = function() {
            const activeRepository = $scope.getActiveRepository();
            if ($scope.error) {
                return;
            } else if (!activeRepository) {
                queryMonitorData = $timeout(getQueryMonitor, POLLING_INTERVAL);
                return;
            }
            $q.all([getPerformanceMonitorData(), getActiveQueryMonitor()])
                .then((response) => {
                    const [performanceData, activeQueryData] = response;
                    const timestamp = new Date();

                    if (performanceData) {
                        Object.values($scope.performanceMonitorData).forEach((chart) => {
                            chart.addData(timestamp, performanceData);
                        });
                    }

                    if (activeQueryData) {
                        $scope.queriesChart.addData(timestamp, {activeQueryData, performanceData});
                    }

                    if ($scope.firstLoad) {
                        $scope.firstLoad = false;

                        const timer = $timeout(function () {
                            $scope.loader = false;
                        }, 500);

                        $scope.$on('$destroy', function () {
                            $timeout.cancel(timer);
                        });
                    }

                    queryMonitorData = $timeout(getQueryMonitor, POLLING_INTERVAL);
                });
        };
        const getPerformanceMonitorData = function () {
            const activeRepository = $scope.getActiveRepository();
            return MonitoringRestService.monitorQueryTransactionStatistics(activeRepository).then(function (response) {
                return response.data;
            }).catch(function (data) {
                $scope.error = getError(data);
                $scope.loader = false;
            });
        };
        const getActiveQueryMonitor = function () {
            const activeRepository = $scope.getActiveRepository();
            return MonitoringRestService.monitorQuery(activeRepository).then(function (response) {
                return response.data;
            }).catch(function (data) {
                $scope.error = getError(data);
                $scope.loader = false;
            });
        };
        let structuresMonitorPoll;
        const getStructuresMonitorData = function () {
            const activeRepository = $scope.getActiveRepository();
            if ($scope.error) {
                return;
            } else if (!activeRepository) {
                structuresMonitorPoll = $timeout(getStructuresMonitorData, POLLING_INTERVAL);
                return;
            }
            MonitoringRestService.monitorStructures(activeRepository).then(function (response) {
                const data = response.data;
                if (data) {
                    const timestamp = new Date();

                    Object.values($scope.structuresMonitorData).forEach((chart) => {
                        chart.addData(timestamp, data);
                    });

                    if ($scope.firstLoad) {
                        $scope.firstLoad = false;

                        const timer = $timeout(function () {
                            $scope.loader = false;
                        }, 500);

                        $scope.$on('$destroy', function () {
                            $timeout.cancel(timer);
                        });
                    }
                }
                structuresMonitorPoll = $timeout(getStructuresMonitorData, POLLING_INTERVAL);
            }).catch(function (data) {
                $scope.error = getError(data);
                $scope.loader = false;
            });
        };

        getResourceMonitorData();
        getQueryMonitor();
        getStructuresMonitorData();

        $scope.$on('$destroy', function () {
            if (resourceMonitorPoll) {
                $timeout.cancel(resourceMonitorPoll);
            }
            if (queryMonitorData) {
                $timeout.cancel(queryMonitorData);
            }
            if (structuresMonitorPoll) {
                $timeout.cancel(structuresMonitorPoll);
            }
        });
    }]);
