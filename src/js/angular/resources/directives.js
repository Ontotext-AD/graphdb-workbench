import * as echarts from "echarts";

const chartsDirective = angular.module('graphdb.framework.resources.directives', []);

chartsDirective.directive('chart', ['$rootScope',
    function ($rootScope) {
        return {
            restrict: 'AE',
            scope: {
                chart: '=',   //chart options, [required]
            },
            link: function (scope, element) {
                let myChart;

                const languageChangedSubscription = $rootScope.$on('$translateChangeSuccess', () => {
                    scope.chart.translateLabels()
                    myChart.setOption(scope.chart.chartOptions);

                });

                scope.$watch('chart', function () {
                    initChart();
                })


                function refreshChart() {
                    myChart.setOption(scope.chart.chartOptions);
                    scope.chart.updateRange(scope.chart.dataHolder)
                    myChart.hideLoading();
                }

                function initChart() {
                    myChart = echarts.init(element[0], null, {renderer: 'svg'});
                    myChart.setOption(scope.chart.chartOptions);
                    myChart.showLoading();

                    myChart.on('legendselectchanged', handleLegendSelect)
                    scope.chart.registerRefreshHandler(refreshChart)
                    window.addEventListener('resize', handleWindowResize);
                }

                function handleLegendSelect(legendSelectEvent) {
                    scope.chart.setSelectedSeries(legendSelectEvent.selected);
                }

                function handleWindowResize() {
                    myChart.resize();
                }

                scope.$on("$destroy", function () {
                    myChart.on('legendselectchanged')
                    myChart.dispose();
                    scope.chart.unregisterRefreshHandler(refreshChart)
                    languageChangedSubscription();
                    window.removeEventListener('resize', handleWindowResize);
                });
            }
        }
    }
]);
