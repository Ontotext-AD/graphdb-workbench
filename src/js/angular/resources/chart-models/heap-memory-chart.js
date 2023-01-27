import {ChartData} from "./chart-data";

export class HeapMemoryChart extends ChartData {
    chartSetup() {
        this.chartOptions.chart.color = d3.scale.category10().range();
        this.chartOptions.title = {
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
    addNewData(timestamp, data) {
        const [committed, used] = this.data;
        committed.values.push([timestamp, data.heapMemoryUsage.committed]);
        used.values.push([timestamp, data.heapMemoryUsage.used]);
        if (data.heapMemoryUsage.max > 0) {
            const maxMemory = this.formatBytesValue(data.heapMemoryUsage.max);
            this.chartOptions.title.enable = true;
            this.chartOptions.title.text = this.translateService.instant('resource.memory.heap.max', {max: maxMemory});
        }
    }
    updateRange() {
        this.setScale();
        const maxChartValue = Math.max(...this.data.filter((data)=> !data.disabled).flatMap((data) => data.values).flatMap((data) => data[1]));
        const domainUpperBound = maxChartValue * 1.2;
        this.chartOptions.chart.yDomain = [0, domainUpperBound];
    }
    setScale() {
        this.chartOptions.chart.yAxis.tickFormat = (d) => {
            return this.formatBytesValue(d);
        };
    }
    formatBytesValue(value) {
        const maxChartValue = Math.max(...this.data.filter((data)=> !data.disabled).flatMap((data) => data.values).flatMap((data) => data[1]));
        const k = 1024;
        const i = Math.floor(Math.log(maxChartValue) / Math.log(k));
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const relativeValue = parseFloat(value) / Math.pow(k, i);
        return `${relativeValue.toFixed(2)} ${sizes[i]}`;
    }
}
