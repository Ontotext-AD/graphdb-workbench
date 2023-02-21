import {ChartData} from "../chart-data";

export class EpoolChart extends ChartData {
    constructor(translateService) {
        super(translateService, false, false);
    }
    chartSetup(chartOptions) {
        const customChartOptions = {
            type: 'multiChart',
            yAxis1: {
                showMaxMin: false,
                axisLabel: this.translateService.instant('resource.epool.reads'),
                axisLabelDistance: -10,
                rotateYLabel: true,
                tickFormat: function(d) {
                    return d;
                },
                tickValues: () => {
                    return EpoolChart.getIntegerRangeForValues(this.dataHolder[0]);
                }
            },
            yAxis2: {
                showMaxMin: false,
                axisLabel: this.translateService.instant('resource.epool.writes'),
                axisLabelDistance: -10,
                rotateYLabel: true,
                tickFormat: function(d) {
                    return d;
                },
                tickValues: () => {
                    return EpoolChart.getIntegerRangeForValues(this.dataHolder[1]);
                }
            },
            y1Domain: [0, 1],
            y2Domain: [0, 1]
        };
        Object.assign(chartOptions.chart, customChartOptions);
    }

    getTitle() {
        return this.translateService.instant('resource.epool.label');
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
        this.chartOptions.chart.yDomain1 = this.getAxisDomain(dataHolder[0]);
        this.chartOptions.chart.yDomain2 = this.getAxisDomain(dataHolder[1]);
    }
    getAxisDomain(dataHolder) {
        const [domainUpperBound] = EpoolChart.calculateMaxChartValueAndDivisions(dataHolder);
        return [0, domainUpperBound];
    }
}
