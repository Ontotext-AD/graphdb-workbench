import {EventDataType} from './event-data-type';
import {QueryRequest} from '../query-request';
import {CountQueryRequestEventPayload} from './event-payload';

/**
 * Model for event of type {@link EventDataType.COUNT_QUERY} emitted by "ontotext-yasgui-web-component".
 */
export class CountQueryRequestEvent {
  public type = EventDataType.COUNT_QUERY as const;
  public query: string;
  public queryMode: string;
  public queryType: string;
  public pageSize: number;
  public request: QueryRequest;

  /**
   * Constructs the model for {@link EventDataType.DOWNLOAD_AS} event.
   *
   * @param eventPayload - event payload emitted by "ontotext-yasgui-web-component" when coun query is executed.
   * The count query is executed to retrieve the total number of results when the actual result set contains more
   * results than those currently displayed in YASR.
   */
  constructor(eventPayload: CountQueryRequestEventPayload) {
    this.query = eventPayload.query;
    this.queryMode = eventPayload.queryMode;
    this.queryType = eventPayload.queryType;
    this.pageSize = eventPayload.pageSize;
    this.request = eventPayload.request;
  }

  setPageSize(pageSize?: string) {
    this.request._data['pageSize'] = pageSize;
  }

  setPageNumber(pageNumber?: string) {
    this.request._data['pageNumber'] = pageNumber;
  }

  setCount(count: number) {
    this.request._data['count'] = count;
  }
}
