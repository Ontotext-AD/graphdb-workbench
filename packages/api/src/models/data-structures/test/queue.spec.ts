import { Queue } from '../queue';

describe('Queue', () => {
  it('enqueue should add items and size should reflect number of items', () => {
    const queue = new Queue<number>();
    expect(queue.size()).toBe(0);
    expect(queue.isEmpty()).toBe(true);

    queue.enqueue(1);
    queue.enqueue(2);

    expect(queue.isEmpty()).toBe(false);
    expect(queue.size()).toBe(2);
  });

  it('dequeue should return items in FIFO order and reduce size', () => {
    const queue = new Queue<string>();
    queue.enqueue('a');
    queue.enqueue('b');
    queue.enqueue('c');

    expect(queue.dequeue()).toBe('a');
    expect(queue.size()).toBe(2);
    expect(queue.dequeue()).toBe('b');
    expect(queue.dequeue()).toBe('c');
    expect(queue.dequeue()).toBeUndefined();
    expect(queue.isEmpty()).toBe(true);
  });

  it('dequeueAll should return all items and empty the queue', () => {
    const queue = new Queue<number>();
    queue.enqueue(10);
    queue.enqueue(20);
    queue.enqueue(30);

    const all = queue.dequeueAll();
    expect(all).toEqual([10, 20, 30]);
    expect(queue.isEmpty()).toBe(true);
    expect(queue.size()).toBe(0);
  });

  it('peek should return first item without removing it', () => {
    const queue = new Queue<string>();
    queue.enqueue('x');
    queue.enqueue('y');

    expect(queue.peek()).toBe('x');
    expect(queue.size()).toBe(2);
  });

  it('peek should return undefined for empty queue', () => {
    const queue = new Queue<number>();
    expect(queue.peek()).toBeUndefined();
  });

  it('peekAll should return a shallow copy of all items without removing them', () => {
    const queue = new Queue<object>();
    const o1 = { id: 1 };
    const o2 = { id: 2 };
    queue.enqueue(o1);
    queue.enqueue(o2);

    const copy = queue.peekAll();
    // Should be an array copy with the same elements, not the internal reference
    expect(Array.isArray(copy)).toBe(true);
    expect(copy).toEqual([o1, o2]);
    expect(queue.size()).toBe(2);

    // Mutating the returned array should not change the queue
    (copy).push({ id: 3 });
    expect(copy).toHaveLength(3);
    expect(queue.size()).toBe(2);
  });

  it('peekAll should return an empty array for empty queue', () => {
    const queue = new Queue<string>();
    const copy = queue.peekAll();
    expect(Array.isArray(copy)).toBe(true);
    expect(copy).toEqual([]);
    expect(queue.isEmpty()).toBe(true);
  });
});
