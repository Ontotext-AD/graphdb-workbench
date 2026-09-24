/**
 * Represents a callback function invoked when an event is emitted.
 *
 * @template T - The type of the event payload.
 * @param payload - The payload associated with the emitted event.
 */
export type EventSubscriptionCallback<T> = (payload: T) => void;
