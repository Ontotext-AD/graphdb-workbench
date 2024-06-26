export class SequenceGeneratorUtil {

    static getFibonacciSequenceGenerator() {
        return SequenceGeneratorUtil.fibonacciSequenceGenerator();
    }

    static fibonacciSequenceGenerator() {
        let fibo1 = 0;
        let fibo2 = 1;

        return {
            next: function () {
                const next = fibo2;
                fibo2 = fibo1 + fibo2;
                fibo1 = next;
                return next;
            },

            reset: function () {
                fibo1 = 0;
                fibo2 = 1;
            }
        };
    }
}
