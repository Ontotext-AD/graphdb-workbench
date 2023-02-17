import {HeapMemoryChart} from "./heap-memory-chart";

export class NonHeapMemoryChart extends HeapMemoryChart {
    constructor(translateService, chartOptions) {
        super(translateService, chartOptions, false, false);
    }

    parseData(data) {
        return data.nonHeapMemoryUsage;
    }
}
