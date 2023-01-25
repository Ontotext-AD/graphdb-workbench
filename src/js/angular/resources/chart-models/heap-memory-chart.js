import {ChartData} from "./chart-data";

export class HeapMemoryChart extends ChartData {
    chartSetup() {
        this.chartOptions.chart.color = d3.scale.category10().range();
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
        this.data[0].values.push([timestamp, data.heapMemoryUsage.committed]);
        this.data[1].values.push([timestamp, data.heapMemoryUsage.used]);
    }
    updateRange() {
        this.setScale();
        const maxChartValue = Math.max(...this.data.filter((data)=> !data.disabled).flatMap((data) => data.values).flatMap((data) => data[1]));
        const domainUpperBound = maxChartValue * 1.2;
        this.chartOptions.chart.yDomain = [0, domainUpperBound];
    }
    setScale() {
        const maxChartValue = Math.max(...this.data.filter((data)=> !data.disabled).flatMap((data) => data.values).flatMap((data) => data[1]));
        const k = 1024;
        const i = Math.floor(Math.log(maxChartValue) / Math.log(k));
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        this.chartOptions.chart.yAxis.tickFormat = (d) => {
            const relativeValue = parseFloat(d) / Math.pow(k, i);
            return `${relativeValue.toFixed(2)} ${sizes[i]}`;
        };
    }
}
