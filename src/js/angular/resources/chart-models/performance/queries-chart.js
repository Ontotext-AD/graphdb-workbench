import {ChartData} from "../chart-data";

export class QueriesChart extends ChartData {
    constructor(translateService) {
        super(translateService, false, false);
    }

    getTitle() {
        return this.translateService.instant('resource.queries.label');
    }

    chartSetup(chartOptions) {
        chartOptions.chart.yAxis.tickValues = () => {
            return QueriesChart.getIntegerRangeForValues(this.dataHolder);
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
        this.setSubTitle(this.translateService.instant('resource.queries.slow_and_suboptimal', {slowQueries, suboptimal}));
    }
}
