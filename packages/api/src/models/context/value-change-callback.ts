/**
 * Type definition for a callback function that is triggered when the value of the context changes.
 *
 * @template T - The type of the value passed to the callback function.
 * @param value - A value of type T.
 */
export type ValueChangeCallback<T> = (value: T | undefined) => void;
