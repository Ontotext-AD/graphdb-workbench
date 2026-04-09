import {OntotextYasguiEvent} from './ontotext-yasgui-event';
import {RequestAbortedRequest} from '../request-aborted-request';
import {EventDataType} from './event-data-type';

/**
 * Model for event of type {@link EventDataType.REQUEST_ABORTED} emitted by "ontotext-yasgui-web-component".
 */
export class RequestAbortedEvent {
  public type: EventDataType;
  public request: RequestAbortedRequest;
  public queryMode: string;

  /**
   * Constructs the model for {@link EventDataType.REQUEST_ABORTED} event.
   *
   * @param eventData - event emitted by "ontotext-yasgui-web-component".
   */
  constructor(eventData: OntotextYasguiEvent) {
    this.type = eventData.type;
    this.request = eventData.payload.requestAbortedRequest!;
    this.queryMode = eventData.payload.queryMode;
  }

  getQueryTrackAlias() {
    if (this.request?.header) {
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
