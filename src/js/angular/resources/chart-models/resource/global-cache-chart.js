import {ChartData} from '../chart-data';

export class GlobalCacheChart extends ChartData {
    constructor(translateService, filter) {
        super(translateService, false, false, filter);
    }

    chartSetup(chartOptions) {
        chartOptions.chart.yAxis.tickFormat = (d) => this.formatNumber(d);
    }

    getTitle() {
        return this.translateService.instant('resources.global_cache.label');
    }

    createDataHolder() {
        return [{
            key: this.translateService.instant('resources.global_cache.hits'),
            values: []
        }, {
            key: this.translateService.instant('resources.global_cache.miss'),
            values: []
        }];
    }
    addNewData(dataHolder, timestamp, data) {
        const [hit, miss] = dataHolder;
        hit.values.push([timestamp, data.cacheHit]);
        miss.values.push([timestamp, data.cacheMiss]);
    }
}
