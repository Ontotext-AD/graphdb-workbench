import {EventDataType} from './event-data-type';
import {QueryRequest} from '../query-request';
import {QueryRequestEventPayload} from './event-payload';

/**
 * Model for event of type {@link EventDataType.QUERY} emitted by "ontotext-yasgui-web-component".
 */
export class QueryRequestEvent {
  public type = EventDataType.QUERY as const;
  public query: string;
  public queryMode: string;
  public queryType: string;
  public pageSize: number;
  public request: QueryRequest;

  /**
   * Constructs the model for {@link EventDataType.QUERY} event.
   *
   * @param eventPayload - event payload emitted by "ontotext-yasgui-web-component" when a qeury is executed.
   * Holds the request, which must be updated with additional information such as the repository ID and location.
   */
  constructor(eventPayload: QueryRequestEventPayload) {
    this.query = eventPayload.query;
    this.queryMode = eventPayload.queryMode;
    this.queryType = eventPayload.queryType;
    this.pageSize = eventPayload.pageSize;
    this.request = eventPayload.request;
  }

  setPageSize(pageSize?: string) {
    this.request._data['pageSize'] = pageSize;
  }

  getPageSize() {
    return this.request._data['pageSize'] ? Number.parseInt(this.request._data['pageSize']) : undefined;
  }

  setPageNumber(pageNumber?: string) {
    this.request._data['pageNumber'] = pageNumber;
  }

  getPageNumber() {
    return this.request._data['pageNumber'] ? Number.parseInt(this.request._data['pageNumber']) : undefined;
  }

  setOffset(offset: number) {
    this.request._data['offset'] = offset;
  }

  setLimit(limit: number) {
    this.request._data['limit'] = limit;
  }
}
