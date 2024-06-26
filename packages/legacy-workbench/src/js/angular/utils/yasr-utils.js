// This is table plugin configuration constant.
// It holds default value of window width when column resizing will be enabled.
const DEFAULT_ENABLE_COLUMN_RESIZING_ON_WINDOW_WIDTH = 768;

const YasrUtils = (function () {

    const getYasrConfiguration = function (configuartion) {
        const defaultConfiguration = {
            table: getDefaultTablePluginConfiguration()
        };

        return angular.extend({}, defaultConfiguration, configuartion);
    };

    const getDefaultTablePluginConfiguration = function () {
        return {
            enableColumnResizingOnWindowWidth: DEFAULT_ENABLE_COLUMN_RESIZING_ON_WINDOW_WIDTH
        };
    };

    return {
        getYasrConfiguration,
        getDefaultTablePluginConfiguration
    };
})();

export {
    YasrUtils
};
