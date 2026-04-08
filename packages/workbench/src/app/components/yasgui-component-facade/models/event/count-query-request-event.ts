import {EventData} from './event-data';
import {EventDataType} from './event-data-type';

/**
 * Model for event of type {@link EventDataType.COUNT_QUERY} emitted by "ontotext-yasgui-web-component".
 */
export class CountQueryRequestEvent {
  private type: EventDataType;
  private query: string | undefined;
  private queryMode: string | undefined;
  private queryType: string | undefined;
  private pageSize: number | undefined;
  private request: Request;

  /**
   * Constructs the model for {@link EventDataType.DOWNLOAD_AS} event.
   *
   * @param eventData - event emitted by "ontotext-yasgui-web-component".
   */
  constructor(eventData: EventData) {
    this.type = eventData.type;
    this.query = eventData.payload.query;
    this.queryMode = eventData.payload.queryMode;
    this.queryType = eventData.payload.queryType;
    this.pageSize = eventData.payload.pageSize;
    this.request = eventData.payload.request;
  }

  setPageSize(pageSize) {
    this.request._data['pageSize'] = pageSize;
  }

  setPageNumber(pageNumber) {
    this.request._data['pageNumber'] = pageNumber;
  }

  setCount(count) {
    this.request._data['count'] = count;
  }
}
