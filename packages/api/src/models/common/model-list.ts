import { Model } from './model';

/**
 * Abstract base class for managing a list of items that extends the {@link Model} class.
 *
 * This class provides common utility methods for manipulating and querying the list of items,
 * such as sorting, filtering, and finding elements. Subclasses can extend this class to work
 * with specific types of models.
 *
 * @template T - The type of items in the list.
 */
export abstract class ModelList<T> extends Model<T> {
  /**
   * The list of items managed by this class.
   */
  protected items: T[];

  /**
   * Creates an instance of the {@link ModelList}.
   *
   * @param items - An optional array of items to initialize the list. If no items are provided,
   *                an empty array is used by default.
   */
  protected constructor(items: T[] = []) {
    super();
    this.items = items;
  }

  getItems(): T[] {
    return this.items;
  }

  /**
   * Sorts the items in place using the specified comparator function.
   *
   * @param comparator - A comparison function that defines the sort order.
   *                     Should return a negative number if `a` < `b`,
   *                     zero if `a` === `b`, or a positive number if `a` > `b`.
   *
   * @example
   * const modelList = new MyModelList([{ id: 2 }, { id: 1 }]);
   * modelList.sort((a, b) => a.id - b.id);
   * console.log(modelList.items); // Outputs: [{ id: 1 }, { id: 2 }]
   */
  sort(comparator: (a: T, b: T) => number): void {
    this.items.sort(comparator);
  }

  /**
   * Filters the items using the specified filter function.
   *
   * @param filterFunction - A function that returns `true` for items to include
   *                         and `false` for items to exclude.
   * @returns A new array of items that match the filter criteria.
   */
  filter(filterFunction: (item: T) => boolean): T[] {
    return this.items.filter(filterFunction);
  }

  /**
   * Finds an item in the list that matches the specified filter function.
   *
   * @param filterFunction - A function that returns `true` for the desired item.
   * @returns The first item that matches the filter criteria, or `undefined` if none match.
   */
  find(filterFunction: (item: T) => boolean): T | undefined {
    return this.items.find(filterFunction);
  }

  /**
   * Checks if the collection of items is empty.
   *
   * @returns {boolean} - Returns `true` if there are no items in the collection, otherwise `false`.
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Creates a filter function to include only objects with matching IDs.
   *
   * @param ids - An array of IDs to filter by.
   * @returns A filter function that returns `true` for objects with an `id` property matching any of the provided IDs.
   */
  protected createIdFilter<T extends { id: string | number }>(ids: (string | number)[]): (item: T) => boolean {
    return (item: T) => !ids.includes(item.id);
  }
}
