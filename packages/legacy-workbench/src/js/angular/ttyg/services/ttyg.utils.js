export const getHumanReadableTimestamp = ($translate, $filter, timestamp, options = {}) => {

    if (!timestamp) {
        return '';
    }

    const date = new Date(timestamp);
    const today = new Date();

    // Get start of today
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Get start of yesterday
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);

    // Get start of the timestamp's day
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const time = options.timeFormat ? $filter('date')(date, options.timeFormat) : '';

    if (dateStart.getTime() === todayStart.getTime()) {
        return $translate.instant('common.dates.today') + time;
    } else if (dateStart.getTime() === yesterdayStart.getTime()) {
        return $translate.instant('common.dates.yesterday') + time;
    } else {
        // ISO format is the least ambiguous if no date format is passed.
        const dateFormat = options.dateFormat || 'yyyy-MM-dd';
        return $filter('date')(date, dateFormat) + time;
    }
};
