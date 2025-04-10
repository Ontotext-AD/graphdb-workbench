/**
 * @ngdoc filter
 * @name bytes
 * @module graphdb.framework.core.filters.bytes
 * @description Converts a number of bytes into a human-readable string with units
 * @param {number} bytes The number of bytes to convert
 * @param {number} [precision=1] Number of decimal places to display
 * @returns {string} Formatted string with appropriate unit (bytes, kB, MB, GB, TB, PB)
 * @example
 * // returns "1.5 MB"
 * {{ 1572864 | bytes }}
 *
 * // returns "1.50 MB"
 * {{ 1572864 | bytes:2 }}
 */
angular.module('graphdb.framework.core.filters.bytes', [])
    .filter('bytes', function () {
        return function (bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
                return '-';
            }
            if (typeof precision === 'undefined') {
                precision = 1;
            }
            const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
            let number = Math.floor(Math.log(bytes) / Math.log(1024));

            const unit = units[number];
            // If the unit is bytes, we don't need to display the decimal places.'
            if ('bytes' === unit) {
                precision = 0;
            }
            return (bytes / Math.pow(1024, number)).toFixed(precision) + ' ' + unit;
        };
    });
