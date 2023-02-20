export class ChartData {
    /**
     * Defines the default multiplier for chart overhead. The space above the maximum value.
     */
    static get DEFAULT_MULTIPLIER() {
        return 1.2;
    }

    /**
     * Defines the default divisions for chart. Used to calculate chart ticks.
     */
    static get MAXIMUM_DIVISIONS() {
        return 10;
    }

    constructor(translateService, disableRangeUpdate, disableOldDataRemoval) {
        this.initialChartSetup(translateService, disableRangeUpdate, disableOldDataRemoval);
    }

    initialChartSetup(translateService, disableRangeUpdate, disableOldDataRemoval, resetData = true) {
        this.disableRangeUpdate = disableRangeUpdate;
        this.disableOldDataRemoval = disableOldDataRemoval;
        this.translateService = translateService;
        this.range = 150;
        this.chartOptions = this.getDefaultChartOptions(translateService);
        this.chartSetup(this.chartOptions);
        if (resetData) {
            this.dataHolder = this.createDataHolder();
            this.firstLoad = true;
        }
    }

    refresh() {
        this.initialChartSetup(this.translateService, this.disableRangeUpdate, this.disableOldDataRemoval, false);
        this.translateLabels(this.dataHolder);
        this.updateRange(this.dataHolder);
    }


    /**
     * Hook used to translate all labels. Default implementation translates dataHolder series keys
     * @param dataHolder
     */
    translateLabels(dataHolder) {
        this.createDataHolder().forEach((series, index) => {
            if (dataHolder[index].originalKey) {
                dataHolder[index].originalKey = series.key;
            } else {
                dataHolder[index].key = series.key;
            }
        });
    }

    /**
     * Must implement
     * @return {string} the title name
     */
    getTitle() {
        return 'No chart title set';
    }

    setTitle(title) {
        this.chartOptions.title.enable = true;
        this.chartOptions.title.text = title;
    }

    getSubTitle() {
    }

    setSubTitle(subTitle) {
        this.chartOptions.subtitle.enable = true;
        this.chartOptions.subtitle.html = subTitle;
    }

    /**
     * Provides chart options if custom setup needs to be done
     * @param chartOptions
     */
    chartSetup(chartOptions) {
    }

    /**
     * Returns the data holder array for the chart data.
     * Must be implemented.
     */
    createDataHolder() {
        throw new Error('Must implement data holder creation');
    }

    /**
     * Adds data to the data holder
     * @param timestamp time of the data
     * @param newData the new data
     */
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

    /**
     * Removes data from the data holder that is obsolete based on range property
     * @param dataHolder data holder
     * @param range the number of entries to keep
     */
    removeOldData(dataHolder, range) {
        if (dataHolder[0].values.length > range) {
            dataHolder.forEach((data) => data.values.shift());
        }
    }

    /**
     * Adds data to data holder
     * Must be implemented.
     * @param dataHolder
     * @param timestamp
     * @param data
     * @param isFirstLoad
     */
    addNewData(dataHolder, timestamp, data, isFirstLoad) {
    }

    /**
     * Updates the chart axis range, based on maximum value in data holder
     * @param dataHolder
     * @param multiplier
     */
    updateRange(dataHolder, multiplier) {
        const [domainUpperBound] = ChartData.calculateMaxChartValueAndDivisions(dataHolder, multiplier);
        this.chartOptions.chart.yDomain = [0, domainUpperBound];
    }

    isFirstLoad() {
        return this.firstLoad;
    }

    getDefaultChartOptions(translateService) {
        return {
            chart: {
                interpolate: 'monotone',
                type: 'lineChart',
                height: 500,
                margin: {
                    left: 80,
                    right: 80
                },
                x: function (d) {
                    return d[0];
                },
                y: function (d) {
                    return d[1];
                },
                clipEdge: true,
                noData: translateService.instant('resource.no_data'),
                showControls: false,
                duration: 0,
                rightAlignYAxis: false,
                useInteractiveGuideline: true,
                xAxis: {
                    showMaxMin: false,
                    tickFormat: function (d) {
                        return d3.time.format('%X')(new Date(d));
                    }
                },
                yAxis: {
                    showMaxMin: false,
                    tickFormat: function (d) {
                        return d;
                    }
                },
                legend: {
                    maxKeyLength: 100
                },
                color: d3.scale.category10().range()
            },
            title: {
                enable: true,
                text: this.getTitle()
            },
            subtitle: {
                className: 'chart-additional-info',
                enable: true,
                text: this.getSubTitle()
            }
        };
    }

    /**
     * Returns the maximum value in data holder
     * @param dataHolder
     * @return {number}
     */
    static getMaxValueFromDataHolder(dataHolder) {
        return Math.max(...dataHolder.filter((data) => !data.disabled).flatMap((data) => ChartData.getMaxValueForDataSeries(data)));
    }

    /**
     * Returns the maximum value in specific data series
     * @param dataSeries
     * @return {number}
     */
    static getMaxValueForDataSeries(dataSeries) {
        return Math.max(...dataSeries.values.map((data) => data[1]));
    }

    /**
     * Calculated maximum value for chart axis and divisions width
     * @param dataHolder
     * @param multiplier
     * @return {(number|number)[]}
     */
    static calculateMaxChartValueAndDivisions(dataHolder, multiplier) {
        let maxDataValue;

        if (Array.isArray(dataHolder)) {
            maxDataValue = ChartData.getMaxValueFromDataHolder(dataHolder);
        } else {
            maxDataValue = ChartData.getMaxValueForDataSeries(dataHolder);
        }

        const maxChartValue = Math.round(maxDataValue * (multiplier || ChartData.DEFAULT_MULTIPLIER)) || 1;
        const div = Math.ceil(maxChartValue / ChartData.MAXIMUM_DIVISIONS);
        return [maxChartValue, div];
    }

    /**
     * Returnes a D3 range for chart axis based on maximum value and divisions width
     * @param dataHolder
     * @param multiplier
     * @return {*}
     */
    static getIntegerRangeForValues(dataHolder, multiplier) {
        const [maxChartValue, divisions] = ChartData.calculateMaxChartValueAndDivisions(dataHolder, multiplier);
        return d3.range(0, maxChartValue + 1, divisions);
    }
}
