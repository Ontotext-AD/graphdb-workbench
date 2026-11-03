import * as echarts from 'echarts';
import {ChartData} from './chart-models/chart-data';
import {RuntimeConfigurationContextService, service, ThemeService} from '@ontotext/workbench-api';
import {ChartThemes} from './chart-themes';

const chartsDirective = angular.module('graphdb.framework.resources.directives', []);

chartsDirective.directive('chart', ['$rootScope', '$translate',
    function($rootScope, $translate) {
        const themeService = service(ThemeService);
        const runtimeConfigurationContextService = service(RuntimeConfigurationContextService);

        return {
            restrict: 'AE',
            scope: {
                chart: '=', //chart options, [required]
            },
            link: function(scope, element) {
                let myChart;
                let isLoading = false;
                let subscriptions = [];

                function refreshChart() {
                    myChart.setOption(scope.chart.chartOptions);
                    scope.chart.updateRange(scope.chart.dataHolder);
                    myChart.hideLoading();
                    isLoading = false;
                }

                function initChart() {
                    // The theme may have changed while the chart was not shown, e.g. while another tab was open.
                    scope.chart.refreshThemeColors();
                    createEchartsInstance();
                    showLoading();

                    scope.chart.registerRefreshHandler(refreshChart);
                    scope.chart.translateLabels();
                    window.addEventListener('resize', handleWindowResize);
                }

                function createEchartsInstance() {
                    const theme = themeService.isDarkModeApplied() ? ChartThemes.DARK_THEME : ChartThemes.LIGHT_THEME;
                    myChart = echarts.init(element[0], theme, {renderer: 'svg'});
                    myChart.setOption(scope.chart.chartOptions);
                    myChart.on('legendselectchanged', handleLegendSelect);
                }

                function showLoading() {
                    myChart.showLoading({
                        text: $translate.instant('common.loading'),
                        maskColor: `color-mix(in srgb, ${ChartData.cssVar('--gw-default-background')}, transparent 20%)`,
                        textColor: ChartData.cssVar('--gw-default-color'),
                    });
                    isLoading = true;
                }

                function handleThemeModeChange(themeMode) {
                    if (!themeMode || !myChart) {
                        return;
                    }
                    ChartThemes.initThemes();
                    scope.chart.refreshThemeColors();
                    myChart.dispose();
                    createEchartsInstance();
                    if (isLoading) {
                        showLoading();
                    }
                }

                function handleLegendSelect(legendSelectEvent) {
                    scope.chart.setSelectedSeries(legendSelectEvent.selected);
                }

                function handleWindowResize() {
                    myChart.resize();
                }

                function handleLanguageChange() {
                    scope.chart.translateLabels();
                    myChart.setOption(scope.chart.chartOptions);
                }

                function handleDestroy() {
                    myChart.off('legendselectchanged');
                    myChart.dispose();
                    scope.chart.unregisterRefreshHandler(refreshChart);
                    subscriptions.forEach((unsubscribe) => unsubscribe());
                    window.removeEventListener('resize', handleWindowResize);
                }

                function init() {
                    ChartThemes.initThemes();
                    subscriptions = [
                        $rootScope.$on('$translateChangeSuccess', handleLanguageChange),
                        // The colors are read from the CSS variables when the chart is created, so the chart is
                        // created again with the colors of the new theme.
                        runtimeConfigurationContextService.onThemeModeChanged(handleThemeModeChange, true),
                    ];
                    scope.$watch('chart', initChart);
                    scope.$on('$destroy', handleDestroy);
                }

                init();
            },
        };
    },
]);
