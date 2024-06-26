export class DateUtils {

    /**
     * Generates a string representing the current date and time using a Date instance in a specific format.
     * The format is YYYY-MM-DD HH:mm:ss.SSS, where:
     * YYYY is the four-digit year.
     * MM is the two-digit month (01 = January, 12 = December).
     * DD is the two-digit day of the month.
     * HH is the two-digit hour in 24-hour format.
     * mm is the two-digit minute.
     * ss is the two-digit second.
     * SSS is the three-digit millisecond.
     * @return {string} The formatted date and time string.
     */
    static formatCurrentDateTime() {
        const date = new Date();
        return date.getFullYear() + '-' + _.padStart(date.getMonth() + 1, 2, '0') + '-' + _.padStart(date.getDate(), 2, '0')
            + ' ' + _.padStart(date.getHours(), 2, '0') + ':' + _.padStart(date.getMinutes(), 2, '0') + ':' + _.padStart(date.getSeconds(), 2, '0')
            + '.' + _.padStart(date.getMilliseconds(), 3, '0');
    }
}
