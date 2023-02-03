import {ChartData} from '../chart-data';

export class GlobalCacheChart extends ChartData {
    constructor(translateService, chartOptions) {
        super(translateService, chartOptions, false, false);
    }
    chartSetup(chartOptions) {
        chartOptions.chart.color = d3.scale.category10().range();
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
