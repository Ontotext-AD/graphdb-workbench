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
        const performanceData = data.performanceData;
        dataHolder[0].values.push([timestamp, performanceData.activeTransactions]);
        dataHolder[1].values.push([timestamp, performanceData.openConnections]);
    }
    updateRange(dataHolder) {
        super.updateRange(dataHolder, 2);
    }
}
