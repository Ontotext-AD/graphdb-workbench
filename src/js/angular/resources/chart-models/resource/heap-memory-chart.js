import {ChartData} from "../chart-data";

export class HeapMemoryChart extends ChartData {
    constructor(translateService) {
        super(translateService, false, false);
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
        this.setMaxHeapSize(memoryData.max);
    }

    parseData(data) {
        return data.heapMemoryUsage;
    }

    setMaxHeapSize(max) {
        if (max > 0) {
            const subTitleKeyValues = [{
                label: this.translateService.instant('resource.memory.heap.max'),
                value: HeapMemoryChart.formatBytesValue(max)
            }];
            this.setSubTitle(subTitleKeyValues);
        }
    }

    updateRange(dataHolder) {
        this.setScale(dataHolder);
        super.updateRange(dataHolder);
    }
    setScale(dataHolder) {
        this.chartOptions.chart.yAxis.tickFormat = (d) => {
            return HeapMemoryChart.formatBytesValue(d, dataHolder);
        };
    }
}
