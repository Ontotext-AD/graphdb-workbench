import 'angular/core/services';
import 'angular/core/services/repositories.service';
import 'angular/rest/monitoring.rest.service';
import 'lib/nvd3/nv.d3';

const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.rest.monitoring.service',
    'toastr'
];

const resourcesCtrl = angular.module('graphdb.framework.jmx.resources.controllers', modules);

resourcesCtrl.controller('ResourcesCtrl', ['$scope', 'toastr', '$interval', '$timeout', 'MonitoringRestService',
    function ($scope, toastr, $interval, $timeout, MonitoringRestService) {
        $scope.data = {
            classCount: [{
                key: 'Classes',
                values: []
            }],
            cpuLoad: [{
                key: 'System CPU Load',
                values: []
            }],
            memoryUsage: [{
                key: 'Used memory',
                values: []
            }],
            threadCount: [{
                key: 'Thread Count',
                values: []
            }]
        };
        $scope.firstLoad = true;
        $scope.activeTab = 'memory';
        $scope.jolokiaError = '';
        $scope.loader = true;
        $scope.garbadgeCollectorLoader = false;
        $scope.getResourcesData = function () {
            if ($scope.jolokiaError) {
                return;
            }
            MonitoringRestService.monitorResources().success(function (data) {
                if (data) {
                    if ($scope.data.classCount[0].values.length === 100) {
                        $scope.clearData();
                    }

                    const timestamp = new Date();

                    if ($scope.firstLoad) {
                        $scope.firstLoad = false;
                        $scope.data.classCount[0].values.push([timestamp, data.classCount * 2]);
                        $scope.data.cpuLoad[0].values.push([timestamp, (parseFloat(data.cpuLoad)).toFixed(2) * 2]);
                        $scope.data.memoryUsage[0].values.push([timestamp, (data.heapMemoryUsage.used / 1000000000).toFixed(2) * 2]);
                        $scope.data.threadCount[0].values.push([timestamp, data.threadCount * 2]);
                        const timer = $timeout(function () {
                            $scope.loader = false;
                        }, 500);
                        $scope.$on('$destroy', function () {
                            $timeout.cancel(timer);
                        });
                    }

                    if (!$scope.firstLoad) {
                        if (data.classCount > $scope.data.classCount[0].values[0][1]) {
                            $scope.data.classCount[0].values[0][1] = data.classCount * 2;
                        }
                        if (parseFloat(data.cpuLoad) > $scope.data.cpuLoad[0].values[0][1]) {
                            if (parseFloat(data.cpuLoad) > 50) {
                                $scope.data.cpuLoad[0].values[0][1] = 100;
                            } else {
                                $scope.data.cpuLoad[0].values[0][1] = (parseFloat(data.cpuLoad)).toFixed(2) * 2;
                            }
                        }
                        if ((data.heapMemoryUsage.used / 1000000000) > $scope.data.memoryUsage[0].values[0][1]) {
                            $scope.data.memoryUsage[0].values[0][1] = (data.heapMemoryUsage.used / 1000000000).toFixed(2) * 2;
                        }
                        if (data.threadCount > $scope.data.threadCount[0].values[0][1]) {
                            $scope.data.threadCount[0].values[0][1] = data.threadCount * 2;
                        }
                    }
                    $scope.data.classCount[0].values.push([timestamp, data.classCount]);
                    $scope.data.cpuLoad[0].values.push([timestamp, (parseFloat(data.cpuLoad)).toFixed(4)]);
                    $scope.data.memoryUsage[0].values.push([timestamp, (data.heapMemoryUsage.used / 1000000000).toFixed(4)]);
                    $scope.data.threadCount[0].values.push([timestamp, data.threadCount]);
                }

            }).error(function (data) {
                $scope.jolokiaError = getError(data);
                $scope.loader = false;
            });
        };

        $scope.clearData = function () {
            $scope.data.classCount[0].values = $scope.data.classCount[0].values.slice(50);
            $scope.data.classCount[0].values[0][0] = $scope.data.classCount[0].values[1][0];
            $scope.data.classCount[0].values[0][1] = $scope.data.classCount[0].values[1][1] * 2;

            $scope.data.cpuLoad[0].values = $scope.data.cpuLoad[0].values.slice(50);
            $scope.data.cpuLoad[0].values[0][0] = $scope.data.cpuLoad[0].values[1][0];
            $scope.data.cpuLoad[0].values[0][1] = (parseFloat($scope.data.cpuLoad[0].values[1][1])).toFixed(2) * 2;

            $scope.data.memoryUsage[0].values = $scope.data.memoryUsage[0].values.slice(50);
            $scope.data.memoryUsage[0].values[0][0] = $scope.data.memoryUsage[0].values[1][0];
            $scope.data.memoryUsage[0].values[0][1] = (parseFloat($scope.data.memoryUsage[0].values[1][1])).toFixed(2) * 2;

            $scope.data.threadCount[0].values = $scope.data.threadCount[0].values.slice(50);
            $scope.data.threadCount[0].values[0][0] = $scope.data.threadCount[0].values[1][0];
            $scope.data.threadCount[0].values[0][1] = $scope.data.threadCount[0].values[1][1] * 2;
        };

        const timer = $interval(function () {
            $scope.getResourcesData();
        }, 2000);

        $scope.$on('$destroy', function () {
            $interval.cancel(timer);
        });

        $scope.chartConfig = {refreshDataOnly: true};
        $scope.chartOptions = {
            chart: {
                type: 'stackedAreaChart',
                height: 500,
                width: 1000,
                margin: {
                    top: 40,
                    right: 40,
                    bottom: 60,
                    left: 100
                },
                x: function (d) {
                    return d[0];
                },
                y: function (d) {
                    return d[1];
                },
                clipEdge: true,
                noData: 'No Data Available.',
                showControls: false,
                rightAlignYAxis: false,
                transitionDuration: 500,
                useVoronoi: false,
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
        $scope.chartMemoryOptions = angular.copy($scope.chartOptions);
        $scope.chartMemoryOptions.chart.yAxis.tickFormat = function (d) {
            return d + ' GB';
        };
        $scope.chartCPUOptions = angular.copy($scope.chartOptions);
        $scope.chartCPUOptions.chart.yAxis.tickFormat = function (d) {
            return d + '%';
        };

        $scope.garbadgeCollector = function () {

            $scope.garbadgeCollectorLoader = true;
            MonitoringRestService.monitorGC().success(function () {
                toastr.success('Garbage collection performed.');
                $scope.garbadgeCollectorLoader = false;
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error');
                $scope.garbadgeCollectorLoader = false;
            });
        };
    }]);
