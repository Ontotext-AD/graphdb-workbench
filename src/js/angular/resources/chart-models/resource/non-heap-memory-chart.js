import {HeapMemoryChart} from "./heap-memory-chart";

export class NonHeapMemoryChart extends HeapMemoryChart {
    constructor(translateService, themeService) {
        super(translateService, themeService, false, false);
    }

    parseData(data) {
        return data.nonHeapMemoryUsage;
    }
}
