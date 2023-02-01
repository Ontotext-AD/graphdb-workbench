export class ChartData {
    constructor(translateService, chartOptions, disableRangeUpdate, disableOldDataRemoval) {
        this.disableRangeUpdate = disableRangeUpdate;
        this.disableOldDataRemoval = disableOldDataRemoval;
        this.translateService = translateService;
        this.range = 150;
        this.chartOptions = chartOptions;
        this.chartSetup(this.chartOptions);
        this.dataHolder = this.createDataHolder();
        this.firstLoad = true;
    }
    chartSetup(chartOptions) {}
    createDataHolder() {
        throw new Error('Must implement data holder creation');
    }
    addData(timestamp, newData) {
        if (!this.disableOldDataRemoval) {
            this.removeOldData(this.dataHolder, this.range);
        }
        this.addNewData(this.dataHolder, timestamp, newData, this.isFirstLoad());
        if (!this.disableRangeUpdate) {
            this.updateRange(this.dataHolder);
        }
        if (this.firstLoad) {
            this.firstLoad = false;
        }
    }
    removeOldData(dataHolder, range) {
        if (dataHolder[0].values.length > range) {
            dataHolder.forEach((data) => data.values.shift());
        }
    }
    addNewData(dataHolder, timestamp, data, isFirstLoad) {}

    updateRange(dataHolder, multiplier) {
        const maxChartValue = ChartData.getMaxValueFromDataHolder(dataHolder);
        const domainUpperBound = maxChartValue * (multiplier || 1.2);
        this.chartOptions.chart.yDomain = [0, domainUpperBound || 1];
    }
    isFirstLoad() {
        return this.firstLoad;
    }

    static getMaxValueFromDataHolder(dataHolder) {
        return Math.max(...dataHolder.filter((data)=> !data.disabled).flatMap((data) => data.values).flatMap((data) => data[1]));
    }
}
