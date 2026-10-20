import type {EventDetail, EventType} from 'graphwise-reactodia';

/**
 * Handles one type of the notifications graphwise-reactodia dispatches through its `graphwiseReactodiaEvent`.
 *
 * @template T The notification type this handler handles.
 */
export interface GraphwiseReactodiaEventHandler<T extends EventType = EventType> {
  /**
   * Whether this handler handles the given notification type.
   *
   * @param type - The `detail.type` of the event.
   */
  canHandle(type: EventType): boolean;

  /**
   * Handles a notification whose type this handler can handle.
   *
   * @param detail - The `detail` of the event.
   */
  handle(detail: EventDetail<T>): void;
}
