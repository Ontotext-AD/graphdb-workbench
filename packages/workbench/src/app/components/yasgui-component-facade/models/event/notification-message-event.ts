import {EventDataType} from './event-data-type';
import {NotificationMessageEventPayload} from './event-payload';

/**
 * Model for event of type {@link EventDataType.NOTIFICATION_MESSAGE} emitted by "ontotext-yasgui-web-component".
 */
export class NotificationMessageEvent {
  public type = EventDataType.NOTIFICATION_MESSAGE as const;
  public message: string;
  public code: string;
  public messageType: string;

  /**
   * Constructs the model for {@link EventDataType.NOTIFICATION_MESSAGE} event.
   *
   * @param eventPayload - event payload emitted by "ontotext-yasgui-web-component" when a notification message is need to be displayed.
   */
  constructor(eventPayload: NotificationMessageEventPayload) {
    this.message = eventPayload.message;
    this.code = eventPayload.code;
    this.messageType = eventPayload.messageType;
  }
}
