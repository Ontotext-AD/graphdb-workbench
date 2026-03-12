import {EventData} from './event-data';

/**
 * Model for event of type {@link EventDataType.QUERY_EXECUTED} emitted by "ontotext-yasgui-web-component".
 */
export class QueryExecutedEvent {
  TYPE: string;
  duration: number;
  tabId: string;

  /**
   * Constructs the model for {@link EventDataType.QUERY_EXECUTED} event.
   *
   * @param eventData - event emitted by "ontotext-yasgui-web-component".
   */
  constructor(eventData: EventData) {
    this.TYPE = eventData.TYPE;
    this.duration = eventData.payload.duration;
    this.tabId = eventData.payload.tabId;
  }
}
