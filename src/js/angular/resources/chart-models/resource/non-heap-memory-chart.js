import {HeapMemoryChart} from "./heap-memory-chart";

export class NonHeapMemoryChart extends HeapMemoryChart {
    constructor(translateService) {
        super(translateService, false, false);
    }

    getTitle() {
        return this.translateService.instant('resource.memory.non_heap.label');
    }

    parseData(data) {
        return data.nonHeapMemoryUsage;
    }
}
