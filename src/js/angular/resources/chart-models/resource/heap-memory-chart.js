import {ChartData} from "../chart-data";

export class HeapMemoryChart extends ChartData {
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
            key: this.translateService.instant('resource.memory.committed'),
            values: []
        }, {
            key: this.translateService.instant('resource.memory.used'),
            area: 'true',
            values: []
        }];
    }
    addNewData(dataHolder, timestamp, data) {
        const [committed, used] = dataHolder;
        committed.values.push([timestamp, data.heapMemoryUsage.committed]);
        used.values.push([timestamp, data.heapMemoryUsage.used]);
        if (data.heapMemoryUsage.max > 0) {
            const maxMemory = this.formatBytesValue(data.heapMemoryUsage.max, dataHolder);
            this.chartOptions.title.enable = true;
            this.chartOptions.title.text = this.translateService.instant('resource.memory.heap.max', {max: maxMemory});
        }
    }
    updateRange(dataHolder) {
        this.setScale(dataHolder);
        const maxChartValue = Math.max(...dataHolder.filter((data)=> !data.disabled).flatMap((data) => data.values).flatMap((data) => data[1]));
        const domainUpperBound = maxChartValue * 1.2;
        this.chartOptions.chart.yDomain = [0, domainUpperBound];
    }
    setScale(dataHolder) {
        this.chartOptions.chart.yAxis.tickFormat = (d) => {
            return this.formatBytesValue(d, dataHolder);
        };
    }
    formatBytesValue(value, dataHolder) {
        const maxChartValue = Math.max(...dataHolder.filter((data)=> !data.disabled).flatMap((data) => data.values).flatMap((data) => data[1]));

        const k = 1024;
        const i = Math.floor(Math.log(maxChartValue) / Math.log(k));
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const relativeValue = parseFloat(value) / Math.pow(k, i);
        return `${relativeValue.toFixed(2)} ${sizes[i]}`;
    }
}
