import {ChartData} from "../chart-data";

export class QueriesChart extends ChartData {
    constructor($translate, ThemeService) {
        super($translate, ThemeService, false, false);
    }

    createDataHolder() {
        return [{
            name: this.translateService.instant('resource.queries.running'),
            type: 'line',
            showSymbol: false,
            smooth: true,
            data: []
        }];
    }

    translateLabels() {
        const [queriesSeries] = this.dataHolder;
        queriesSeries.name = this.translateService.instant('resource.queries.running');
        this.configureSubtitle();
    }

    addNewData(dataHolder, timestamp, data) {
        const {activeQueryData, performanceData} = data;

        this.latestData = {
            slowQueries: performanceData.queries.slow,
            suboptimal: performanceData.queries.suboptimal,
            activeQueryData,
            performanceData
        }

        dataHolder[0].data.push({
            value: [
                timestamp,
                activeQueryData.length
            ]
        });

        this.configureSubtitle();
    }

    updateRange(dataHolder, multiplier) {
        const [max, minInterval] = ChartData.getIntegerRangeForValues(dataHolder, this.selectedSeries)
        this.chartOptions.yAxis.max = max;
        this.chartOptions.yAxis.minInterval = minInterval;
    }

    configureSubtitle() {
        const subTitleKeyValues = [{
            label: this.translateService.instant('resource.queries.slow'),
            value: this.latestData.slowQueries
        }, {
            label: this.translateService.instant('resource.queries.suboptimal'),
            value: this.latestData.suboptimal
        }];

        this.setSubTitle(subTitleKeyValues);
    }
}
