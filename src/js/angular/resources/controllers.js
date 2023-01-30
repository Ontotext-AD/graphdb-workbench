import 'angular/core/services';
import 'angular/core/services/repositories.service';
import 'angular/rest/monitoring.rest.service';
import 'lib/nvd3/nv.d3';
import {FileDescriptorsChart} from "./chart-models/file-descriptors-chart";
import {HeapMemoryChart} from "./chart-models/heap-memory-chart";
import {NonHeapMemoryChart} from "./chart-models/non-heap-memory-chart";
import {CpuLoadChart} from "./chart-models/cpu-load-chart";
import {DiskStorageChart} from "./chart-models/disk-storage-chart";

const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.rest.monitoring.service'
];

const resourcesCtrl = angular.module('graphdb.framework.jmx.resources.controllers', modules);

resourcesCtrl.controller('ResourcesCtrl', ['$scope', '$timeout', 'MonitoringRestService', '$translate',
    function ($scope, $timeout, MonitoringRestService, $translate) {
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
                duration: 1,
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

        let firstLoad = true;

        $scope.activeTab = 'resourceMonitor';
        $scope.error = '';
        $scope.loader = true;
        $scope.chartConfig = {refreshDataOnly: true, extended: false};
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

        getResourceMonitorData();

        $scope.$on('$destroy', function () {
            if (resourceMonitorPoll) {
                $timeout.cancel(resourceMonitorPoll);
            }
        });
    }]);
