import {HeapMemoryChart} from "./heap-memory-chart";

export class NonHeapMemoryChart extends HeapMemoryChart {
    constructor(translateService) {
        super(translateService, false, false);
    }

    configureSubtitle(isNonHeapChart) {
        if (this.latestData.max > 0) {
            const subTitleKeyValues = [{
                label: this.translateService.instant('resource.memory.non_heap.max'),
                value: HeapMemoryChart.formatBytesValue(this.latestData.max, null, this.selectedSeries)
            }];
            this.setSubTitle(subTitleKeyValues);
        }
    }

    parseData(data) {
        return data.nonHeapMemoryUsage;
    }
}
