import {HeapMemoryChart} from "./heap-memory-chart";

export class NonHeapMemoryChart extends HeapMemoryChart {
    addNewData(timestamp, data) {
        this.data[0].values.push([timestamp, data.nonHeapMemoryUsage.committed]);
        this.data[1].values.push([timestamp, data.nonHeapMemoryUsage.used]);
        this.setScale();
    }
}
