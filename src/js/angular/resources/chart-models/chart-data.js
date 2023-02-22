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

    static get COLORS() {
        return ['#003663', '#E84E0F', '#02A99A', '#999999'];
    }

    constructor(translateService, disableRangeUpdate, disableOldDataRemoval, filter) {
        this.filter = filter;
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

    setSubTitle(keyValues) {
        this.chartOptions.title.enable = true;
        const subTitleElements = keyValues.map((keyValue) => {
            if (Array.isArray(keyValue.value) && !keyValue.value.length) {
                return;
            }
            const values = Array.isArray(keyValue.value) ? keyValue.value.join('/') : keyValue.value;
            return keyValue.label + (values !== undefined ? `<span class="data-value">${values}</span>` : '');
        });
        this.chartOptions.title.html = subTitleElements.map((subTitleElement) => `<span class="info-element">${subTitleElement}</span>`);
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
        this.removeOldData(this.dataHolder, this.range);
        this.addNewData(this.dataHolder, timestamp, newData, this.isFirstLoad());
        this.updateRange(this.dataHolder);
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
        if (this.disableOldDataRemoval) {
            return;
        }
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
        if (this.disableRangeUpdate) {
            return;
        }
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
                color: ChartData.COLORS
            },
            title: {
                enable: true,
                className: 'chart-additional-info',
                html: ' '
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

    static formatBytesValue(value, dataHolder) {
        let maxChartValue = value;
        if (dataHolder) {
            maxChartValue = Math.max(...dataHolder.filter((data)=> !data.disabled).flatMap((data) => data.values).flatMap((data) => data[1]));
        }

        const k = 1024;
        const i = Math.floor(Math.log(maxChartValue) / Math.log(k));
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const relativeValue = parseFloat(value) / Math.pow(k, i);
        return `${relativeValue.toFixed(2)} ${sizes[i]}`;
    }

    formatNumber(value) {
        if (!value || !this.filter) {
            return;
        }
        // This may look strange, but I made it like this for consistency. When/if fixing it will be easier to find.
        return this.filter('currency')(value, '', 0);
    }
}
