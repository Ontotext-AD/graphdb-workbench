import {ChartData} from "../chart-data";

export class ConnectionsChart extends ChartData {
    constructor($translate, ThemeService) {
        super($translate, ThemeService, false, false);
    }

    createDataHolder() {
        return [{
            name: this.translateService.instant('resource.connections.active'),
            type: 'line',
            showSymbol: false,
            smooth: true,
            data: []
        }, {
            name: this.translateService.instant('resource.connections.open'),
            type: 'line',
            showSymbol: false,
            smooth: true,
            data: []
        }];
    }

    translateLabels() {
        const [activeTransactionsSeries, openConnectionsSeries] = this.dataHolder;
        activeTransactionsSeries.name = this.translateService.instant('resource.connections.active');
        openConnectionsSeries.name = this.translateService.instant('resource.connections.open');
    }

    addNewData(dataHolder, timestamp, data) {
        const [activeTransactionsSeries, openConnectionsSeries] = dataHolder;
        const {activeTransactions, openConnections} = data.performanceData;

        activeTransactionsSeries.data.push({
            value: [
                timestamp,
                activeTransactions
            ]
        });
        openConnectionsSeries.data.push({
            value: [
                timestamp,
                openConnections
            ]
        });
    }

    updateRange(dataHolder, multiplier) {
        const [max, minInterval] = ChartData.getIntegerRangeForValues(dataHolder, this.selectedSeries)
        this.chartOptions.yAxis.max = max;
        this.chartOptions.yAxis.minInterval = minInterval;
    }
}
