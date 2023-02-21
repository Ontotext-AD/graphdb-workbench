import 'angular/core/services';
import 'angular/core/services/repositories.service';
import 'angular/rest/monitoring.rest.service';
import 'lib/nvd3/nv.d3';
import 'angular/rest/cluster.rest.service';
import {FileDescriptorsChart} from './chart-models/resource/file-descriptors-chart';
import {HeapMemoryChart} from './chart-models/resource/heap-memory-chart';
import {NonHeapMemoryChart} from './chart-models/resource/non-heap-memory-chart';
import {CpuLoadChart} from './chart-models/resource/cpu-load-chart';
import {DiskStorageChart} from './chart-models/resource/disk-storage-chart';
import {QueriesChart} from './chart-models/performance/queries-chart';
import {GlobalCacheChart} from './chart-models/resource/global-cache-chart';
import {ConnectionsChart} from './chart-models/performance/connections-chart';
import {ClusterHealthChart} from './chart-models/cluster-health/cluster-health-chart';
import {EpoolChart} from './chart-models/performance/epool-chart';

const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.rest.monitoring.service',
    'graphdb.framework.rest.cluster.service'
];

const resourcesCtrl = angular.module('graphdb.framework.jmx.resources.controllers', modules);

resourcesCtrl.controller('ResourcesCtrl', ['$scope', '$rootScope', '$timeout', 'MonitoringRestService', '$translate', '$repositories', '$q', 'ClusterRestService',
    function($scope, $rootScope, $timeout, MonitoringRestService, $translate, $repositories, $q, ClusterRestService) {
        const POLLING_INTERVAL = 2000;
        const MAX_RETRIES = 3;

        $rootScope.$on('$translateChangeSuccess', function (event, args) {
            Object.values($scope.resourceMonitorData).forEach((chart) => chart.refresh());
            Object.values($scope.performanceMonitorData).forEach((chart) => chart.refresh());
            Object.values($scope.structuresMonitorData).forEach((chart) => chart.refresh());
            $scope.clusterHealthChart.refresh();
        });

        $scope.resourceMonitorData = {
            cpuLoad: new CpuLoadChart($translate),
            fileDescriptors: new FileDescriptorsChart($translate),
            heapMemory: new HeapMemoryChart($translate),
            offHeapMemory: new NonHeapMemoryChart($translate),
            diskStorage: new DiskStorageChart($translate)
        };
        $scope.performanceMonitorData = {
            connectionsChart: new ConnectionsChart($translate),
            epoolChart: new EpoolChart($translate),
            queriesChart: new QueriesChart($translate)
        };
        $scope.structuresMonitorData = {
            globalCacheChart: new GlobalCacheChart($translate)
        };
        $scope.clusterHealthChart = new ClusterHealthChart($translate);

        $scope.activeTab = 'resourceMonitor';
        $scope.error = true;
        $scope.hasCluster = false;

        const hasMonitorError = (errorHolder) => {
            return errorHolder.hasError;
        };

        $scope.loader = true;

        $scope.switchTab = (tab) => {
            $scope.activeTab = tab;
        };

        $scope.getActiveRepository = function() {
            return $repositories.getActiveRepository();
        };

        const getResourceMonitorData = function() {
            return MonitoringRestService.monitorResources()
                .then(function(response) {
                    processResponse(response, (timestamp, data) => {
                        Object.values($scope.resourceMonitorData).forEach((chart) => {
                            chart.addData(timestamp, data);
                        });
                    });
                });
        };
        const getQueryMonitor = function() {
            const activeRepository = $scope.getActiveRepository();
            if (!activeRepository) {
                return Promise.resolve();
            }
            return $q.all([getPerformanceMonitorData(activeRepository), getActiveQueryMonitor(activeRepository)])
                .then((response) => {
                    const [performanceData, activeQueryData] = response;
                    processResponse({data: {performanceData, activeQueryData}}, (timestamp, data) => {
                        Object.values($scope.performanceMonitorData).forEach((chart) => {
                            chart.addData(timestamp, data);
                        });
                    });
                });
        };
        const getPerformanceMonitorData = function(activeRepository) {
            return MonitoringRestService.monitorQueryTransactionStatistics(activeRepository)
                .then(function(response) {
                    return response.data;
                });
        };
        const getActiveQueryMonitor = function(activeRepository) {
            return MonitoringRestService.monitorQuery(activeRepository)
                .then(function(response) {
                    return response.data;
                });
        };
        const getStructuresMonitorData = function() {
            const activeRepository = $scope.getActiveRepository();
            if (!activeRepository) {
                return Promise.resolve();
            }

            return MonitoringRestService.monitorStructures(activeRepository)
                .then(function(response) {
                    processResponse(response, (timestamp, data) => {
                        Object.values($scope.structuresMonitorData).forEach((chart) => {
                            chart.addData(timestamp, data);
                        });
                    });
                });
        };
        const getClusterMonitorData = function() {
            return MonitoringRestService.monitorCluster()
                .then(function(response) {
                    processResponse(response, (timestamp, data) => $scope.clusterHealthChart.addData(timestamp, data));
                });
        };

        const getData = (monitor) => {
            if (hasMonitorError(monitor.error)) {
                if (monitor.error.retries === MAX_RETRIES) {
                    if (monitor.poll) {
                        $timeout.cancel(monitor.poll);
                    }
                    return Promise.resolve();
                }
                monitor.error.retries++;
            }
            return monitor.fetchFn()
                .then(() => {
                    clearMonitorError(monitor);
                })
                .catch((error) => {
                    setMonitorError(monitor, error);
                })
                .finally(() => {
                    if (monitor.poll) {
                        $timeout.cancel(monitor.poll);
                    }
                    monitor.poll = $timeout(() => getData(monitor), POLLING_INTERVAL);
                });
        };
        const processResponse = (response, dataSetter) => {
            const data = response.data;
            if (data) {
                setChartData(data, dataSetter);
            }
        };
        const setChartData = (data, dataSetter) => {
            const timestamp = new Date();
            dataSetter(timestamp, data);
        };
        const setMonitorError = (monitor, error) => {
            monitor.error.hasError = !!error;
            if (monitor.error.hasError) {
                monitor.error.message = getError(error);
            }
            $scope.error = Object.values($scope.monitors).some((mon) => mon.error.hasError);
        };
        const clearMonitorError = (monitor) => {
            monitor.error.hasError = false;
            monitor.error.message = '';
            $scope.error = Object.values($scope.monitors).some((mon) => mon.error.hasError);
        };

        $scope.monitors = [];
        $scope.monitors.push({
            error: {
                hasError: false,
                message: '',
                retries: 0
            },
            fetchFn: getResourceMonitorData,
            poll: null
        });
        $scope.monitors.push({
            error: {
                hasError: false,
                message: '',
                retries: 0
            },
            fetchFn: getStructuresMonitorData,
            poll: null
        });

        $scope.monitors.push({
            error: {
                hasError: false,
                message: '',
                retries: 0
            },
            fetchFn: getQueryMonitor,
            poll: null
        });

        ClusterRestService.getNodeStatus()
            .then(() => {
                $scope.hasCluster = true;
                const clusterMonitor = {
                    error: {
                        hasError: false,
                        message: '',
                        retries: 0
                    },
                    fetchFn: getClusterMonitorData,
                    poll: null
                };
                $scope.monitors.push(clusterMonitor);
                getData(clusterMonitor);
            })
            .catch(() => {
                $scope.hasCluster = false;
            });

        let loaderTimer = null;
        $q.all($scope.monitors.map((monitor) => getData(monitor)))
            .finally(() => {
                if ($scope.loader) {
                    if (loaderTimer) {
                        $timeout.cancel(loaderTimer);
                    }
                    loaderTimer = $timeout(function() {
                        $scope.loader = false;
                    }, 500);
                }
            });

        $scope.$on('$destroy', function() {
            if (loaderTimer) {
                $timeout.cancel(loaderTimer);
            }
            for (const monitor of $scope.monitors) {
                if (monitor.poll) {
                    $timeout.cancel(monitor.poll);
                }
            }
        });
    }]);
