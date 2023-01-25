import {ChartData} from "./chart-data";

export class FileDescriptorsChart extends ChartData {
    createDataHolder() {
        return [{
            key: this.translateService.instant('resource.system.file_descriptors.open'),
            area: 'true',
            values: []
        }];
    }
    addNewData(timestamp, data) {
        this.data[0].values.push([timestamp, this.formatValue(data.openFileDescriptors)]);
    }
    formatValue(descriptorsCount) {
        return parseFloat(descriptorsCount).toFixed(2);
    }
    updateRange() {
        const maxChartValue = Math.max(...this.data[0].values.flatMap((data) => data[1]));
        const domainUpperBound = maxChartValue * 2;
        this.chartOptions.chart.yDomain = [0, domainUpperBound];
    }
}
