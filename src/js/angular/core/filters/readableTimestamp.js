/**
 * Filter that takes a timestamp and returns a human-readable string for dates that are today or yesterday. Otherwise,
 * it returns the date in the format "MM/DD/YYYY".
 */
angular.module('graphdb.framework.core.filters.readable_titmestamp', [])
    .filter('readableTimestamp', function ($translate) {
        return function (timestamp) {
            const date = new Date(timestamp);
            const today = new Date();

            // Get start of today
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            // Get start of yesterday
            const yesterdayStart = new Date(todayStart);
            yesterdayStart.setDate(todayStart.getDate() - 1);

            // Get start of the timestamp's day
            const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            if (dateStart.getTime() === todayStart.getTime()) {
                return $translate.instant('common.dates.today');
            } else if (dateStart.getTime() === yesterdayStart.getTime()) {
                return $translate.instant('common.dates.yesterday');
            } else {
                // returns in format like "8/16/2024"
                return date.toLocaleDateString();
            }
        };
    });
