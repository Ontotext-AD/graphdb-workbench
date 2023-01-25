import {ChartData} from "./chart-data";

export class CPULoadChartData extends ChartData {
    chartSetup() {
        this.chartOptions.chart.yAxis.tickFormat = function (d) {
            return d + '%';
        };
    }
    createDataHolder() {
        return [{
            key: this.translateService.instant('resource.system.cpu_load.label'),
            values: []
        }];
    }
    addNewData(timestamp, data) {
        this.data[0].values.push([timestamp, this.formatValue(data.cpuLoad)]);
        if (this.loading) {
            this.loading = false;
        }
    }
    formatValue(cpuLoad) {
        return parseFloat(cpuLoad).toFixed(4);
    }
    updateRange() {
        const maxChartValue = Math.max(...this.data[0].values.flatMap((data) => data[1]));
        const domainUpperBound = maxChartValue > 50 ? 100 : maxChartValue * 2;
        this.chartOptions.chart.yDomain = [0, domainUpperBound];
    }
}
