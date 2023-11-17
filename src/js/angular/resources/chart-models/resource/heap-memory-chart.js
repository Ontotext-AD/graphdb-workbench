import {ChartData} from "../chart-data";

export class HeapMemoryChart extends ChartData {
    constructor(translateService, themeService) {
        super(translateService, themeService, false, false);
    }

    chartSetup(chartOptions) {
        const cpuLoadChartOptions = {
            yAxis: {
                axisLabel: {
                    formatter: (value) => {
                        return HeapMemoryChart.formatBytesValue(value, this.dataHolder, this.selectedSeries)
                    }
                },
                min: 0
            },
            tooltip: {
                valueFormatter: (value) => {
                    return HeapMemoryChart.formatBytesValue(value, null, this.selectedSeries)
                }
            }
        }
        _.merge(chartOptions, cpuLoadChartOptions);
    }

    createDataHolder() {
        return [{
            name: this.translateService.instant('resource.memory.committed'),
            type: 'line',
            showSymbol: false,
            smooth: true,
            data: []
        }, {
            name: this.translateService.instant('resource.memory.used'),
            type: 'line',
            areaStyle: {},
            showSymbol: false,
            smooth: true,
            data: []
        }
        ];
    }

    translateLabels() {
        const [committed, used] = this.dataHolder;
        committed.name = this.translateService.instant('resource.memory.committed');
        used.name = this.translateService.instant('resource.memory.used');
        this.configureSubtitle()
    }

    addNewData(dataHolder, timestamp, data) {
        const [committed, used] = dataHolder;
        const memoryData = this.parseData(data);
        this.latestData = {
            committed: memoryData.committed,
            used: memoryData.used,
            max: memoryData.max
        }
        committed.data.push({
            value: [
                timestamp,
                memoryData.committed
            ]
        });
        used.data.push({
            value: [
                timestamp,
                memoryData.used
            ]
        });
        this.configureSubtitle();
    }

    configureSubtitle() {
        if (this.latestData.max > 0) {
            const subTitleKeyValues = [{
                label: this.translateService.instant('resource.memory.heap.max'),
                value: HeapMemoryChart.formatBytesValue(this.latestData.max, null, this.selectedSeries)
            }];
            this.setSubTitle(subTitleKeyValues);
        }
    }

    parseData(data) {
        return data.heapMemoryUsage;
    }

    updateRange(dataHolder, multiplier, selectedSeries) {
        super.updateRange(dataHolder, multiplier, selectedSeries);
    }
}
