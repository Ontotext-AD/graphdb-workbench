import {EventDataType} from './event-data-type';
import {QueryRequest} from '../query-request';
import {OntotextYasguiEvent} from './ontotext-yasgui-event';

/**
 * Model for event of type {@link EventDataType.QUERY} emitted by "ontotext-yasgui-web-component".
 */
export class QueryRequestEvent {
  public type: EventDataType;
  public query: string | undefined;
  public queryMode: string;
  public queryType: string | undefined;
  public pageSize: number | undefined;
  public request: QueryRequest;

  /**
   * Constructs the model for {@link EventDataType.QUERY} event.
   *
   * @param eventData - event emitted by "ontotext-yasgui-web-component".
   */
  constructor(eventData: OntotextYasguiEvent) {
    this.type = eventData.type;
    this.query = eventData.payload.query;
    this.queryMode = eventData.payload.queryMode;
    this.queryType = eventData.payload.queryType;
    this.pageSize = eventData.payload.pageSize;
    this.request = eventData.payload.request;
  }

  setPageSize(pageSize: string) {
    this.request._data['pageSize'] = pageSize;
  }

  getPageSize() {
    return this.request._data['pageSize'] ? parseInt(this.request._data['pageSize']) : undefined;
  }

  setPageNumber(pageNumber: string) {
    this.request._data['pageNumber'] = pageNumber;
  }

  getPageNumber() {
    return this.request._data['pageNumber'] ? parseInt(this.request._data['pageNumber']) : undefined;
  }

  setOffset(offset: number) {
    this.request._data['offset'] = offset;
  }

  setLimit(limit: number) {
    this.request._data['limit'] = limit;
  }
}
