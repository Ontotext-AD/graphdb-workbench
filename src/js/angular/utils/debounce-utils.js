export class DebounceUtils {
    /**
     * Creates a debounced function that delays invoking the provided function until after a specified wait time has
     * elapsed since the last time the debounced function was invoked. Optionally, the function can be invoked immediately
     * and then wait for the specified time before allowing the next invocation.
     * @param {Function} func - The function to debounce.
     * @param {number} wait - The number of milliseconds to delay.
     * @param {boolean} [callImmediately=false] - If true, the function will be invoked immediately, then wait for the specified time
     *                                           before allowing the next invocation.
     * @return {Function} - Returns the new debounced function.
     */
    static debounce(func, wait, callImmediately) {
        let timeout;

        return function(...args) {
            const later = () => {
                timeout = null;
                if (!callImmediately) {
                    func.apply(this, args);
                }
            };
            const callNow = callImmediately && !timeout;

            if (timeout) {
                clearTimeout(timeout);
            }

            timeout = setTimeout(later, wait);

            if (callNow) {
                func.apply(this, args);
            }
        };
    }
}
