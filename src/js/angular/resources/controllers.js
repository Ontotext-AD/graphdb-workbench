import 'angular/core/services';
import 'angular/core/services/repositories.service';
import 'angular/rest/monitoring.rest.service';
import 'lib/nvd3/nv.d3';
import {FileDescriptorsChart} from "./chart-models/file-descriptors-chart";
import {HeapMemoryChart} from "./chart-models/heap-memory-chart";
import {NonHeapMemoryChart} from "./chart-models/non-heap-memory-chart";
import {CPULoadChartData} from "./chart-models/cpu-load-chart";
import {DiskStorageChart} from "./chart-models/disk-storage-chart";

const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.rest.monitoring.service',
    'toastr'
];

const resourcesCtrl = angular.module('graphdb.framework.jmx.resources.controllers', modules);

resourcesCtrl.controller('ResourcesCtrl', ['$scope', 'toastr', '$interval', '$timeout', 'MonitoringRestService', '$translate',
    function ($scope, toastr, $interval, $timeout, MonitoringRestService, $translate) {
        $scope.resourceMonitorData = {};
        $scope.chartConfig = {refreshDataOnly: true, extended: false};
        $scope.chartOptions = {
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

        $scope.resourceMonitorData.cpuLoad = new CPULoadChartData($translate, angular.copy($scope.chartOptions));
        $scope.resourceMonitorData.fileDescriptors = new FileDescriptorsChart($translate, angular.copy($scope.chartOptions));
        $scope.resourceMonitorData.heapMemory = new HeapMemoryChart($translate, angular.copy($scope.chartOptions));
        $scope.resourceMonitorData.offHeapMemory = new NonHeapMemoryChart($translate, angular.copy($scope.chartOptions));
        $scope.resourceMonitorData.diskStorage = new DiskStorageChart($translate, angular.copy($scope.chartOptions));

        $scope.firstLoad = true;
        $scope.activeTab = 'resourceMonitor';
        $scope.error = '';
        $scope.loader = true;
        $scope.getResourceMonitorData = function () {
            if ($scope.error) {
                return;
            }
            MonitoringRestService.monitorResources().success(function (data) {
                if (data) {
                    const timestamp = new Date();

                    Object.values($scope.resourceMonitorData).forEach((chart) => {
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
            }).error(function (data) {
                $scope.error = getError(data);
                $scope.loader = false;
            });
        };

        const timer = $interval(function () {
            $scope.getResourceMonitorData();
        }, 2000);

        $scope.$on('$destroy', function () {
            $interval.cancel(timer);
        });
    }]);
