import {ChartData} from "../chart-data";

export class ConnectionsChart extends ChartData {
    constructor(translateService, chartOptions) {
        super(translateService, chartOptions, false, false);
    }
    chartSetup(chartOptions) {
        chartOptions.chart.color = d3.scale.category10().range();
    }
    createDataHolder() {
        return [{
            key: this.translateService.instant('resource.connections.active'),
            values: []
        }, {
            key: this.translateService.instant('resource.connections.open'),
            values: []
        }];
    }
    addNewData(dataHolder, timestamp, data) {
        dataHolder[0].values.push([timestamp, data.activeTransactions]);
        dataHolder[1].values.push([timestamp, data.openConnections]);
    }
    updateRange(dataHolder) {
        const maxChartValue = Math.max(...dataHolder.filter((data)=> !data.disabled).flatMap((data) => data.values).flatMap((data) => data[1]));
        const domainUpperBound = maxChartValue * 2 || 1;
        this.chartOptions.chart.yDomain = [0, domainUpperBound];
    }
}
