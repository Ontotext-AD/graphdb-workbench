import {ChartData} from "../chart-data";

export class QueriesChart extends ChartData {
    constructor(translateService, chartOptions) {
        super(translateService, chartOptions, false, false);
    }
    chartSetup(chartOptions) {
        chartOptions.chart.color = d3.scale.category10().range();
        chartOptions.title = {
            className: 'chart-additional-info'
        };
    }

    createDataHolder() {
        return [{
            key: this.translateService.instant('resource.queries.running'),
            values: []
        }];
    }
    addNewData(dataHolder, timestamp, data) {
        const {activeQueryData, performanceData} = data;
        dataHolder[0].values.push([timestamp, activeQueryData.length]);

        const slowQueries = performanceData.queries.slow;
        const suboptimal = performanceData.queries.suboptimal;
        this.chartOptions.title.enable = true;
        this.chartOptions.title.text = this.translateService.instant('resource.queries.slow_and_suboptimal', {slowQueries, suboptimal});
    }
    updateRange(dataHolder) {
        const maxChartValue = Math.max(...dataHolder.filter((data)=> !data.disabled).flatMap((data) => data.values).flatMap((data) => data[1]));
        const domainUpperBound = maxChartValue * 2 || 1;
        this.chartOptions.chart.yDomain = [0, domainUpperBound];
    }
}
