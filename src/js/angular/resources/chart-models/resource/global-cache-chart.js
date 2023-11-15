import {ChartData} from '../chart-data';

export class GlobalCacheChart extends ChartData {
    constructor(translateService, themeService, filter) {
        super(translateService, themeService, false, false, filter);
    }

    chartSetup(chartOptions) {
        const globalCacheChartOptions = {
            yAxis: {
                axisLabel: {
                    formatter: (value) => {
                        return this.formatNumber(value);
                    }
                },
                minInterval: 1
            },
            tooltip: {
                valueFormatter: (value) => {
                    return this.formatNumber(value);
                }
            }
        }
        _.merge(chartOptions, globalCacheChartOptions);
    }

    createDataHolder() {
        return [{
            name: this.translateService.instant('resources.global_cache.hits'),
            type: 'line',
            showSymbol: false,
            smooth: true,
            data: []
        }, {
            name: this.translateService.instant('resources.global_cache.miss'),
            type: 'line',
            showSymbol: false,
            smooth: true,
            data: []
        }];
    }

    translateLabels() {
        const [hit, miss] = this.dataHolder;
        hit.name = this.translateService.instant('resources.global_cache.hits');
        miss.name = this.translateService.instant('resources.global_cache.miss');
    }

    addNewData(dataHolder, timestamp, data) {
        const [hit, miss] = dataHolder;

        hit.data.push({
            value: [
                timestamp,
                data.cacheHit
            ]
        });

        miss.data.push({
            value: [
                timestamp,
                data.cacheMiss
            ]
        });
    }
}
