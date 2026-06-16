import {RequestAbortedRequest} from '../request-aborted-request';
import {EventDataType} from './event-data-type';
import {RequestAbortedEventPayload} from './event-payload';

/**
 * Model for event of type {@link EventDataType.REQUEST_ABORTED} emitted by "ontotext-yasgui-web-component".
 */
export class RequestAbortedEvent {
  public type = EventDataType.REQUEST_ABORTED as const;
  public request: RequestAbortedRequest;
  public queryMode: string;

  /**
   * Constructs the model for {@link EventDataType.REQUEST_ABORTED} event.
   *
   * @param eventPayload - event payload emitted by "ontotext-yasgui-web-component" when the Abort query button is clicked.
   */
  constructor(eventPayload: RequestAbortedEventPayload) {
    this.request = eventPayload.request;
    this.queryMode = eventPayload.queryMode;
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
