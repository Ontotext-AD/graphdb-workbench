class Debounce {
    static createDebouncedFunction(func, timeout = 300) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(function() {
                func.apply(this, args);
            }, timeout);
        };
    }
}
