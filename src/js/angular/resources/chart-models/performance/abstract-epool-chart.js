import {ChartData} from "../chart-data";

export class AbstractEpoolChart extends ChartData {
    constructor(translateService, chartOptions) {
        super(translateService, chartOptions, false, false);
    }
    addNewData(dataHolder, timestamp, data, isFirstLoad) {
        const [storedData] = dataHolder;
        let dataDiff = 0;
        const currentEntry = this.getValueFromData(data);
        if (!isFirstLoad) {
            const lastEntry = storedData.values[storedData.values.length - 1][2];
            dataDiff = currentEntry - lastEntry;
        }

        storedData.values.push([timestamp, dataDiff, currentEntry]);
    }
    updateRange(dataHolder) {
        const maxChartValue = Math.max(...dataHolder[0].values.map((data) => data[1]));
        const domainUpperBound = maxChartValue * 1.2;
        this.chartOptions.chart.yDomain = [0, domainUpperBound];
    }
}
