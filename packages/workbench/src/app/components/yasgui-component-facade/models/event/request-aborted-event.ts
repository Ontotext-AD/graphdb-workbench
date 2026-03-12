import {EventData} from './event-data';

interface RequestAbortedEventRequest {
  url: string;
  header?: Record<string, string>;
}

/**
 * Model for event of type {@link EventDataType.REQUEST_ABORTED} emitted by "ontotext-yasgui-web-component".
 */
export class RequestAbortedEvent {
  type: string;
  request: RequestAbortedEventRequest;
  queryMode: string;

  /**
   * Constructs the model for {@link EventDataType.REQUEST_ABORTED} event.
   *
   * @param eventData - event emitted by "ontotext-yasgui-web-component".
   */
  constructor(eventData: EventData) {
    this.type = eventData.type;
    this.request = eventData.payload.request;
    this.queryMode = eventData.payload.queryMode;
  }

  getQueryTrackAlias() {
    if (this.request && this.request.header) {
      return this.request.header['X-GraphDB-Track-Alias'];
    }
    return undefined;
  }

  getRepository() {
    if (this.request) {
      const url = this.request.url;
      return url.substring(url.lastIndexOf('/') + 1);
    }
    return null;
  }
}
