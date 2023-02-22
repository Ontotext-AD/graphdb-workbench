import {ChartData} from "../chart-data";

export class CpuLoadChart extends ChartData {
    constructor(translateService) {
        super(translateService, false, false);
    }
    chartSetup(chartOptions) {
        chartOptions.chart.yAxis.tickFormat = function (d) {
            return d + '%';
        };
    }

    createDataHolder() {
        return [{
            key: this.translateService.instant('resource.system.cpu_load.label'),
            values: []
        }];
    }
    addNewData(dataHolder, timestamp, data) {
        dataHolder[0].values.push([timestamp, this.formatValue(data.cpuLoad)]);
    }
    formatValue(cpuLoad) {
        return parseFloat(cpuLoad).toFixed(4);
    }
    updateRange(dataHolder) {
        const maxChartValue = Math.max(...dataHolder[0].values.flatMap((data) => data[1]));
        const domainUpperBound = maxChartValue > 50 ? 100 : maxChartValue * 2;
        this.chartOptions.chart.yDomain = [0, domainUpperBound];
    }
}
