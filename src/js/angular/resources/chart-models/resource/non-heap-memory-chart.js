import {HeapMemoryChart} from "./heap-memory-chart";

export class NonHeapMemoryChart extends HeapMemoryChart {
    constructor(translateService, chartOptions) {
        super(translateService, chartOptions, false, false);
    }
    addNewData(dataHolder, timestamp, data) {
        dataHolder[0].values.push([timestamp, data.nonHeapMemoryUsage.committed]);
        dataHolder[1].values.push([timestamp, data.nonHeapMemoryUsage.used]);
        this.setScale(dataHolder);
    }
}
