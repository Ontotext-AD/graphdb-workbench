import {ChartData} from "../chart-data";

export class QueriesChart extends ChartData {
    constructor(translateService) {
        super(translateService, false, false);
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
        const subTitleKeyValues = [{
            label: this.translateService.instant('resource.queries.slow'),
            value: slowQueries
        }, {
            label: this.translateService.instant('resource.queries.suboptimal'),
            value: suboptimal
        }];
        this.setSubTitle(subTitleKeyValues);
    }
}
