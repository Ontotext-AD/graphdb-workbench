import {ChartData} from "../chart-data";

export class HeapMemoryChart extends ChartData {
    constructor(translateService) {
        super(translateService, false, false);
    }

    getTitle() {
        return this.translateService.instant('resource.memory.heap.label');
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
        const memoryData = this.parseData(data);
        committed.values.push([timestamp, memoryData.committed]);
        used.values.push([timestamp, memoryData.used]);
        this.setMaxHeapSize(memoryData.max, dataHolder);
    }

    parseData(data) {
        return data.heapMemoryUsage;
    }

    setMaxHeapSize(max, dataHolder) {
        if (max > 0) {
            const maxMemory = this.formatBytesValue(max);
            this.setSubTitle(this.translateService.instant('resource.memory.heap.max', {max: maxMemory}));
        }
    }

    updateRange(dataHolder) {
        this.setScale(dataHolder);
        super.updateRange(dataHolder);
    }
    setScale(dataHolder) {
        this.chartOptions.chart.yAxis.tickFormat = (d) => {
            return this.formatBytesValue(d, dataHolder);
        };
    }
    formatBytesValue(value, dataHolder) {
        let maxChartValue = value;
        if (dataHolder) {
            maxChartValue = Math.max(...dataHolder.filter((data)=> !data.disabled).flatMap((data) => data.values).flatMap((data) => data[1]));
        }

        const k = 1024;
        const i = Math.floor(Math.log(maxChartValue) / Math.log(k));
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const relativeValue = parseFloat(value) / Math.pow(k, i);
        return `${relativeValue.toFixed(2)} ${sizes[i]}`;
    }
}
