import type {EventDetail, EventType} from 'graphwise-reactodia';

/**
 * Handles one type of the events graphwise-reactodia dispatches through its `graphwiseReactodiaEvent`.
 *
 * @template T The event type this handler handles.
 */
export interface GraphwiseReactodiaEventHandler<T extends EventType = EventType> {
  /**
   * Whether this handler handles the given event type.
   *
   * @param type - The `detail.type` of the event.
   */
  canHandle(type: EventType): boolean;

  /**
   * Handles an event whose type this handler can handle.
   *
   * @param detail - The `detail` of the event.
   */
  handle(detail: EventDetail<T>): void;
}
