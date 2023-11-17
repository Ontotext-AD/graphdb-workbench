import {ChartData} from "../chart-data";

export class EpoolChart extends ChartData {
    constructor($translate) {
        super($translate, false, false);
    }

    chartSetup(chartOptions) {
        const epoolChartOptions = {
            grid: {
                containLabel: true,
                left: 40
            },
            yAxis: [
                {
                    name: this.translateService.instant('resource.epool.reads'),
                    nameLocation: 'middle',
                    type: 'value',
                    nameGap: 40,

                },
                {
                    name: this.translateService.instant('resource.epool.writes'),
                    nameLocation: 'middle',
                    type: 'value',
                    nameGap: 40,

                }
            ],
        };
        _.merge(chartOptions, epoolChartOptions);
    }

    createDataHolder() {
        return [{
            name: this.translateService.instant('resource.epool.reads'),
            type: 'line',
            showSymbol: false,
            smooth: true,
            yAxisIndex: 0,
            data: []
        }, {
            name: this.translateService.instant('resource.epool.writes'),
            type: 'line',
            showSymbol: false,
            smooth: true,
            yAxisIndex: 1,
            data: []
        }];
    }

    translateLabels() {
        const [readsData, writesData] = this.dataHolder;
        readsData.name = this.translateService.instant('resource.epool.reads');
        writesData.name = this.translateService.instant('resource.epool.writes');
        this.chartSetup(this.chartOptions);
    }

    addNewData(dataHolder, timestamp, data, isFirstLoad) {
        const performanceData = data.performanceData;
        const [readsData, writesData] = dataHolder;

        let readsDiff = 0;
        let writesDiff = 0;
        const currentReads = performanceData.entityPool.epoolReads;
        const currentWrites = performanceData.entityPool.epoolWrites;

        if (!isFirstLoad) {
            readsDiff = currentReads - this.lastestData.reads ;
            writesDiff = currentWrites - this.lastestData.writes;
        }

        this.lastestData = {
            reads: currentReads,
            writes: currentWrites
        }

        readsData.data.push({
            value: [
                timestamp,
                readsDiff
            ]
        });
        writesData.data.push({
            value: [
                timestamp,
                writesDiff
            ]
        });
    }

    updateRange(dataHolder) {
        dataHolder.forEach((data, i) => {
            const [max, minInterval] = ChartData.getIntegerRangeForValues(data, this.selectedSeries)
            this.chartOptions.yAxis[i].max = max;
            this.chartOptions.yAxis[i].minInterval = minInterval;
        })
    }
}
