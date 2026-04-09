import {EventDataType} from './event-data-type';
import {OntotextYasguiEvent} from './ontotext-yasgui-event';
import {QueryRequest} from '../query-request';

/**
 * Model for event of type {@link EventDataType.COUNT_QUERY} emitted by "ontotext-yasgui-web-component".
 */
export class CountQueryRequestEvent {
  public type = EventDataType.COUNT_QUERY as const;
  public query: string | undefined;
  public queryMode: string | undefined;
  public queryType: string | undefined;
  public pageSize: number | undefined;
  public request: QueryRequest;

  /**
   * Constructs the model for {@link EventDataType.DOWNLOAD_AS} event.
   *
   * @param eventData - event emitted by "ontotext-yasgui-web-component".
   */
  constructor(eventData: OntotextYasguiEvent) {
    this.query = eventData.detail.payload.query;
    this.queryMode = eventData.detail.payload.queryMode;
    this.queryType = eventData.detail.payload.queryType;
    this.pageSize = eventData.detail.payload.pageSize;
    this.request = eventData.detail.payload.request;
  }

  setPageSize(pageSize: string) {
    this.request._data['pageSize'] = pageSize;
  }

  setPageNumber(pageNumber: string) {
    this.request._data['pageNumber'] = pageNumber;
  }

  setCount(count: number) {
    this.request._data['count'] = count;
  }
}
