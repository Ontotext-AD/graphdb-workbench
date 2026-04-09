import {OntotextYasguiEvent} from './ontotext-yasgui-event';
import {EventDataType} from './event-data-type';

/**
 * Model for event of type {@link EventDataType.QUERY_EXECUTED} emitted by "ontotext-yasgui-web-component".
 */
export class QueryExecutedEvent {
  public type = EventDataType.QUERY_EXECUTED as const;
  public duration: number;
  public tabId: string;

  /**
   * Constructs the model for {@link EventDataType.QUERY_EXECUTED} event.
   *
   * @param eventData - event emitted by "ontotext-yasgui-web-component".
   */
  constructor(eventData: OntotextYasguiEvent) {
    this.duration = eventData.detail.payload.duration;
    this.tabId = eventData.detail.payload.tabId;
  }
}
