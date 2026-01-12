import * as echarts from 'echarts';
import {ChartData} from './chart-models/chart-data';
import {service, ThemeService} from '@ontotext/workbench-api';
import {ChartThemes} from './chart-themes';

const chartsDirective = angular.module('graphdb.framework.resources.directives', []);

chartsDirective.directive('chart', ['$rootScope', '$translate',
    function($rootScope, $translate) {
        return {
            restrict: 'AE',
            scope: {
                chart: '=', //chart options, [required]
            },
            link: function(scope, element) {
                ChartThemes.initThemes();

                let myChart;

                const languageChangedSubscription = $rootScope.$on('$translateChangeSuccess', () => {
                    scope.chart.translateLabels();
                    myChart.setOption(scope.chart.chartOptions);
                });

                scope.$watch('chart', function() {
                    initChart();
                });

                function refreshChart() {
                    myChart.setOption(scope.chart.chartOptions);
                    scope.chart.updateRange(scope.chart.dataHolder);
                    myChart.hideLoading();
                }

                function initChart() {
                    const isDarkMode = service(ThemeService).isDarkModeApplied();
                    const theme = isDarkMode ? ChartThemes.DARK_THEME : ChartThemes.LIGHT_THEME;
                    const loadingLabel = $translate.instant('common.loading');
                    myChart = echarts.init(element[0], theme, {renderer: 'svg'});
                    myChart.setOption(scope.chart.chartOptions);
                    myChart.showLoading({
                        text: loadingLabel,
                        maskColor: `color-mix(in srgb, ${ChartData.cssVar('--gw-default-background')}, transparent 20%)`,
                        textColor: ChartData.cssVar('--gw-default-color'),
                    });

                    myChart.on('legendselectchanged', handleLegendSelect);
                    scope.chart.registerRefreshHandler(refreshChart);
                    scope.chart.translateLabels();
                    window.addEventListener('resize', handleWindowResize);
                }

                function handleLegendSelect(legendSelectEvent) {
                    scope.chart.setSelectedSeries(legendSelectEvent.selected);
                }

                function handleWindowResize() {
                    myChart.resize();
                }

                scope.$on('$destroy', function() {
                    myChart.on('legendselectchanged');
                    myChart.dispose();
                    scope.chart.unregisterRefreshHandler(refreshChart);
                    languageChangedSubscription();
                    window.removeEventListener('resize', handleWindowResize);
                });
            },
        };
    },
]);
