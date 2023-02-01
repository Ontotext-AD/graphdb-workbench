import {ChartData} from "../chart-data";

export class FileDescriptorsChart extends ChartData {
    constructor(translateService, chartOptions) {
        super(translateService, chartOptions, false, false);
    }
    chartSetup(chartOptions) {
        chartOptions.title = {
            className: 'chart-additional-info'
        };
        chartOptions.subtitle = {
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
    addNewData(dataHolder, timestamp, data) {
        if (!data.openFileDescriptors) {
            this.chartOptions.title.enable = true;
            this.chartOptions.title.text = this.translateService.instant('resource.system.file_descriptors.only_unix');
            return;
        }
        dataHolder[0].values.push([timestamp, data.openFileDescriptors]);
        if (!this.chartOptions.title.enable) {
            this.chartOptions.title.enable = true;
        }
        this.chartOptions.title.text = this.translateService.instant('resource.system.file_descriptors.max', {max: data.maxFileDescriptors});
    }
    updateRange(dataHolder) {
        super.updateRange(dataHolder, 2);
    }
}
