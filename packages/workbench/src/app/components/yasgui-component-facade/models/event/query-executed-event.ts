import {OntotextYasguiEvent} from './ontotext-yasgui-event';

/**
 * Model for event of type {@link EventDataType.QUERY_EXECUTED} emitted by "ontotext-yasgui-web-component".
 */
export class QueryExecutedEvent {
  type: string;
  duration: number;
  tabId: string;

  /**
   * Constructs the model for {@link EventDataType.QUERY_EXECUTED} event.
   *
   * @param eventData - event emitted by "ontotext-yasgui-web-component".
   */
  constructor(eventData: OntotextYasguiEvent) {
    this.type = eventData.type;
    this.duration = eventData.payload.duration;
    this.tabId = eventData.payload.tabId;
  }
}
