import {ChartData} from "./chart-data";

export class FileDescriptorsChart extends ChartData {
    chartSetup() {
        this.chartOptions.title = {
            className: 'chart-additional-info'
        };
        this.chartOptions.subtitle = {
            enabled: true,
            text: 'only for UNIX'
        };
    }
    createDataHolder() {
        return [{
            key: this.translateService.instant('resource.system.file_descriptors.open'),
            area: 'true',
            values: []
        }];
    }
    addNewData(timestamp, data) {
        if (!data.openFileDescriptors) {
            this.chartOptions.title.enable = true;
            this.chartOptions.title.text = this.translateService.instant('resource.system.file_descriptors.only_unix');
            return;
        }
        this.data[0].values.push([timestamp, data.openFileDescriptors]);
        if (!this.chartOptions.title.enable) {
            this.chartOptions.title.enable = true;
        }
        this.chartOptions.title.text = this.translateService.instant('resource.system.file_descriptors.max', {max: data.maxFileDescriptors});
    }
    updateRange() {
        const maxChartValue = Math.max(...this.data[0].values.flatMap((data) => data[1]));
        const domainUpperBound = maxChartValue * 2;
        this.chartOptions.chart.yDomain = [0, domainUpperBound];
    }
}
