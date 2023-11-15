import 'angular/core/services';
import 'angular/core/services/repositories.service';
import 'angular/rest/monitoring.rest.service';
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

resourcesCtrl.controller('ResourcesCtrl', ['$scope', '$timeout', 'MonitoringRestService', '$translate', '$repositories', '$q', 'ClusterRestService', '$filter', 'ThemeService',
    function($scope, $timeout, MonitoringRestService, $translate, $repositories, $q, ClusterRestService, $filter, ThemeService) {
        const POLLING_INTERVAL = 2000;
        const MAX_RETRIES = 3;

        $scope.AVAILABLE_TABS = Object.freeze({
            'RESOURCE_MONITOR': 'resource',
            'PERFORMANCE_MONITOR': 'performance',
            'CLUSTER_HEALTH': 'cluster'
        });

        const urlFragment = window.location.hash.slice(1);
        const foundTab = Object.keys($scope.AVAILABLE_TABS).find((key) => $scope.AVAILABLE_TABS[key] === urlFragment);
        $scope.activeTab = $scope.AVAILABLE_TABS[foundTab] || $scope.AVAILABLE_TABS.RESOURCE_MONITOR;

        $scope.resourceMonitorData = {
            error: {
                hasError: false,
                message: '',
                retries: 0
            },
            charts: {
                cpuLoad: new CpuLoadChart($translate, ThemeService),
                fileDescriptors: new FileDescriptorsChart($translate, ThemeService, $filter),
                heapMemory: new HeapMemoryChart($translate, ThemeService),
                offHeapMemory: new NonHeapMemoryChart($translate, ThemeService),
                diskStorage: new DiskStorageChart($translate, ThemeService)
            }
        };
        $scope.performanceMonitorData = {
            error: {
                hasError: false,
                message: '',
                retries: 0
            },
            charts: {
                connectionsChart: new ConnectionsChart($translate, ThemeService),
                epoolChart: new EpoolChart($translate, ThemeService),
                queriesChart: new QueriesChart($translate, ThemeService)
            }
        };
        $scope.structuresMonitorData = {
            error: {
                hasError: false,
                message: '',
                retries: 0
            },
            charts: {
                globalCacheChart: new GlobalCacheChart($translate, ThemeService, $filter)
            }
        };
        $scope.clusterHealthData = {
            error: {
                hasError: false,
                message: '',
                retries: 0
            },
            charts: {
                clusterHealthChart: new ClusterHealthChart($translate, ThemeService)
            }
        };

        $scope.hasCluster = false;

        const hasMonitorError = (errorHolder) => {
            return errorHolder.hasError;
        };

        $scope.loader = true;

        $scope.switchTab = (tab) => {
            $scope.activeTab = tab;
            window.location.hash = tab;
        };

        $scope.getActiveRepository = function() {
            return $repositories.getActiveRepository();
        };

        const getResourceMonitorData = function() {
            return MonitoringRestService.monitorResources();
        };
        const getQueryMonitor = function() {
            const activeRepository = $scope.getActiveRepository();
            if (!activeRepository) {
                return Promise.resolve();
            }
            return $q.all([getPerformanceMonitorData(activeRepository), getActiveQueryMonitor(activeRepository)])
                .then((response) => {
                    const [performanceData, activeQueryData] = response;
                    return {data: {performanceData, activeQueryData}};
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

            return MonitoringRestService.monitorStructures(activeRepository);
        };
        const getClusterMonitorData = function() {
            return MonitoringRestService.monitorCluster();
        };

        const getData = (monitor) => {
            if (hasMonitorError(monitor.chartsHolder.error)) {
                if (monitor.chartsHolder.error.retries === MAX_RETRIES) {
                    if (monitor.poll) {
                        $timeout.cancel(monitor.poll);
                    }
                    return Promise.resolve();
                }
                monitor.chartsHolder.error.retries++;
            }
            return monitor.fetchFn()
                .then(function(response) {
                    processResponse(response, monitor);
                })
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
        const processResponse = (response, monitor, dataSetter) => {
            const data = response.data;
            if (data) {
                setChartData(data, monitor, dataSetter);
            }
        };
        const setChartData = (data, monitor, dataSetter) => {
            const timestamp = new Date();
            if (dataSetter) {
                dataSetter(timestamp, data);
            } else {
                Object.values(monitor.chartsHolder.charts).forEach((chart) => {
                    chart.addData(timestamp, data);
                });
            }
        };
        const setMonitorError = (monitor, error) => {
            monitor.chartsHolder.error.hasError = !!error;
            if (monitor.chartsHolder.error.hasError) {
                monitor.chartsHolder.error.message = getError(error);
            }
        };
        const clearMonitorError = (monitor) => {
            monitor.chartsHolder.error.hasError = false;
            monitor.chartsHolder.error.message = '';
        };

        $scope.monitors = [];
        $scope.monitors.push({
            chartsHolder: $scope.resourceMonitorData,
            error: {
                hasError: false,
                message: '',
                retries: 0
            },
            fetchFn: getResourceMonitorData,
            poll: null
        });
        $scope.monitors.push({
            chartsHolder: $scope.structuresMonitorData,
            error: {
                hasError: false,
                message: '',
                retries: 0
            },
            fetchFn: getStructuresMonitorData,
            poll: null
        });

        $scope.monitors.push({
            chartsHolder: $scope.performanceMonitorData,
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
                    chartsHolder: $scope.clusterHealthData,

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
