/**
 * Type definition for a callback function that is triggered before the value of the context changes.
 * Should return a boolean indicating whether the change should be allowed.
 *
 * @template T - The type of the value passed to the callback function.
 * @param value - A value of type T.
 * @return Promise<boolean> - A promise that resolves to a boolean indicating whether the change should be allowed.
 */
export type BeforeChangeValidationPromise<T> = (value: T | undefined) => Promise<boolean>;
