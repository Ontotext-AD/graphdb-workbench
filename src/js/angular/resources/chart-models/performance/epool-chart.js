import {ChartData} from "../chart-data";

export class EpoolChart extends ChartData {
    constructor(translateService, chartOptions) {
        super(translateService, chartOptions, false, false);
    }
    chartSetup(chartOptions) {
        const customChartOptions = {
            type: 'multiChart',
            color: d3.scale.category10().range(),
            margin: {
                left: 100,
                right: 60
            },
            yAxis1: {
                showMaxMin: false,
                axisLabel: this.translateService.instant('resource.epool.reads'),
                axisLabelDistance: -10,
                rotateYLabel: true,
                tickFormat: function(d) {
                    return d;
                }
            },
            yAxis2: {
                showMaxMin: false,
                axisLabel: this.translateService.instant('resource.epool.writes'),
                axisLabelDistance: -10,
                rotateYLabel: true,
                tickFormat: function(d) {
                    return d;
                }
            },
            y1Domain: [0, 1],
            y2Domain: [0, 1]
        };
        Object.assign(chartOptions.chart, customChartOptions);
        chartOptions.chart.color = d3.scale.category10().range();
    }
    createDataHolder() {
        return [{
            key: this.translateService.instant('resource.epool.reads'),
            type: 'line',
            yAxis: 1,
            values: []
        }, {
            key: this.translateService.instant('resource.epool.writes'),
            type: 'line',
            yAxis: 2,
            values: []
        }];
    }
    addNewData(dataHolder, timestamp, data, isFirstLoad) {
        const performanceData = data.performanceData;
        const [readsData, writesData] = dataHolder;
        let readsDiff = 0;
        let writesDiff = 0;
        const currentReads = performanceData.entityPool.epoolReads;
        const currentWrites = performanceData.entityPool.epoolWrites;

        if (!isFirstLoad) {
            const lastReadsEntry = readsData.values[readsData.values.length - 1][2];
            const lastWritesEntry = writesData.values[readsData.values.length - 1][2];
            readsDiff = currentReads - lastReadsEntry;
            writesDiff = currentWrites - lastWritesEntry;
        }

        readsData.values.push([timestamp, readsDiff, currentReads]);
        writesData.values.push([timestamp, writesDiff, currentWrites]);
    }
    updateRange(dataHolder) {
        this.chartOptions.chart.yDomain1 = this.getRangeForAxis(dataHolder[0]);
        this.chartOptions.chart.yDomain2 = this.getRangeForAxis(dataHolder[1]);
    }
    getRangeForAxis(dataHolder) {
        const maxChartValue = Math.max(...dataHolder.values.map((data) => data[1]));
        const domainUpperBound = maxChartValue * 1.2;
        return [0, domainUpperBound || 1];
    }
}
