import {EventDataType} from './event-data-type';
import {OntotextYasguiEvent} from './ontotext-yasgui-event';

/**
 * Model for event of type {@link EventDataType.NOTIFICATION_MESSAGE} emitted by "ontotext-yasgui-web-component".
 */
export class NotificationMessageEvent {
  public type: EventDataType;
  public message: string | undefined;
  public code: string | undefined;
  public messageType: string | undefined;

  /**
   * Constructs the model for {@link EventDataType.NOTIFICATION_MESSAGE} event.
   *
   * @param {EventData} eventData - event emitted by "ontotext-yasgui-web-component".
   */
  constructor(eventData: OntotextYasguiEvent) {
    this.type = eventData.type;
    this.message = eventData.payload.message;
    this.code = eventData.payload.code;
    this.messageType = eventData.payload.messageType;
  }
}
