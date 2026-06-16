import {EventDataType} from './event-data-type';
import {QueryExecutedEventPayload} from './event-payload';

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
   * @param eventPayload - event payload emitted by "ontotext-yasgui-web-component" when a query is executed.
   */
  constructor(eventPayload: QueryExecutedEventPayload) {
    this.duration = eventPayload.duration;
    this.tabId = eventPayload.tabId;
  }
}
