/**
 * A generic FIFO (First In, First Out) queue implementation.
 *
 * This class allows adding items to the end of the queue and removing them from the front, preserving insertion order.
 * It supports basic queue operations such as enqueue, dequeue, peek, checking emptiness, and retrieving the current size.
 *
 * @template T - The type of items stored in the queue.
 */
export class Queue<T> {

  /**
   * Internal array used to store the queue items.
   */
  private items: T[] = [];

  /**
   * Adds an item to the end of the queue.
   *
   * @param item - The item to enqueue.
   */
  enqueue(item: T): void {
    this.items.push(item);
  }

  /**
   * Removes and returns the first item from the queue.
   *
   * @returns The dequeued item, or `undefined` if the queue is empty.
   */
  dequeue(): T | undefined {
    return this.items.shift();
  }

  /**
   * Removes all items from the queue and returns them.
   *
   * @returns An array containing all items that were in the queue.
   */
  dequeueAll(): T[] {
    const removedItems = [...this.items];
    this.items = [];
    return removedItems;
  }

  /**
   * Returns the first item in the queue without removing it.
   *
   * @returns The first item in the queue, or `undefined` if the queue is empty.
   */
  peek(): T | undefined {
    return this.items[0];
  }

  /**
   * Returns a shallow copy of all items currently in the queue
   * without removing them.
   *
   * @returns An array containing all items in the queue.
   */
  peekAll(): T[] {
    return this.items;
  }

  /**
   * Checks whether the queue is empty.
   *
   * @returns `true` if the queue is empty, otherwise `false`.
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Returns the number of items currently in the queue.
   *
   * @returns The number of items in the queue.
   */
  size(): number {
    return this.items.length;
  }
}
