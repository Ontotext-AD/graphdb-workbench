/**
 * Represents a handler that determines whether an event emission should be canceled.
 *
 * The handler resolves to <code>true</code> when the event emission should be canceled,
 * or <code>false</code> when the event should be allowed to proceed.
 */
export type EventSubscriptionCancelHandler = () => Promise<boolean>;
