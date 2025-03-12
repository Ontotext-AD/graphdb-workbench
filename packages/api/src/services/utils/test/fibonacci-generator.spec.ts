import { FibonacciGenerator } from '../fibonacci-generator';

describe('FibonacciGenerator', () => {
  let fibonacciGenerator: FibonacciGenerator;

  beforeEach(() => {
    fibonacciGenerator = new FibonacciGenerator();
  });

  test('should return 1, 2, 3, 5, 8 for the first five calls to next() from initial state', () => {
    // When I call next() five times
    const results = [
      fibonacciGenerator.next(),
      fibonacciGenerator.next(),
      fibonacciGenerator.next(),
      fibonacciGenerator.next(),
      fibonacciGenerator.next()
    ];

    // Then I should get the expected Fibonacci sequence
    const expectedSequence = [1, 1, 2, 3, 5];
    expect(results).toEqual(expectedSequence);
  });

  test('should reset the sequence correctly', () => {
    // Given I've advanced the sequence a few times
    fibonacciGenerator.next();
    fibonacciGenerator.next();
    fibonacciGenerator.next();

    // When I reset the generator
    fibonacciGenerator.reset();

    // Then the next values should be the start of the sequence again
    expect(fibonacciGenerator.next()).toEqual(1);
    expect(fibonacciGenerator.next()).toEqual(1);
    expect(fibonacciGenerator.next()).toEqual(2);
  });

  test('should handle multiple reset calls correctly', () => {
    // Given I've advanced the sequence
    fibonacciGenerator.next();
    fibonacciGenerator.next();

    // When I reset multiple times
    fibonacciGenerator.reset();
    fibonacciGenerator.reset();

    // Then the sequence should still start correctly
    expect(fibonacciGenerator.next()).toEqual(1);
  });
});
