import {Service} from '../../providers/service/service';

/**
 * A generator class for Fibonacci sequence numbers.
 */
export class FibonacciGenerator implements Service {
  /** Current first number in the sequence calculation */
  private fibo1 = 0;
  /** Current second number in the sequence calculation */
  private fibo2 = 1;

  /**
   * Generates the next Fibonacci number in the sequence.
   * Each call advances the sequence by one position.
   *
   * @returns The next number in the Fibonacci sequence
   */
  next(): number {
    const next = this.fibo2;
    this.fibo2 = this.fibo1 + this.fibo2;
    this.fibo1 = next;
    return next;
  };

  /**
   * Resets the generator to its initial state.
   * After calling this method, the next call to next() will return 1.
   */
  reset = () => {
    this.fibo1 = 0;
    this.fibo2 = 1;
  };
}
