export class ChartData {
    constructor(translateService, chartOptions) {
        this.translateService = translateService;
        this.range = 150;
        this.chartOptions = chartOptions;
        this.chartSetup();
        this.data = this.createDataHolder();
    }
    chartSetup() {}
    createDataHolder() {
        throw new Error('Must implement data holder creation');
    }
    addData(timestamp, data) {
        this.removeOldData();
        this.addNewData(timestamp, data);
        this.updateRange();
    }

    removeOldData() {
        if (this.data[0].values.length > this.range) {
            this.data.forEach((data) => data.values.shift());
        }
    }
    addNewData(timestamp, data) {}
    updateRange() {}
}
