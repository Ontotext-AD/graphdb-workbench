import {HeapMemoryChart} from "./heap-memory-chart";

export class NonHeapMemoryChart extends HeapMemoryChart {
    constructor(translateService, chartOptions) {
        super(translateService, chartOptions, false, false);
    }

    getTitle() {
        return this.translateService.instant('resource.memory.non_heap.label');
    }

    parseData(data) {
        return data.nonHeapMemoryUsage;
    }
}
