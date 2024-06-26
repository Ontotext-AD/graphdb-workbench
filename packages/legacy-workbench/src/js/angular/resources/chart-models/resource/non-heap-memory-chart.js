import {HeapMemoryChart} from "./heap-memory-chart";

export class NonHeapMemoryChart extends HeapMemoryChart {
    constructor(translateService) {
        super(translateService, false, false);
    }

    parseData(data) {
        return data.nonHeapMemoryUsage;
    }
}
