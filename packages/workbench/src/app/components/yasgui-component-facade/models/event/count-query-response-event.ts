import {EventData} from './event-data';
import {EventDataType} from './event-data-type';
import {QueryResponse} from '../query-response';

/**
 * Model for event of type {@link EventDataType.COUNT_QUERY_RESPONSE} emitted by "ontotext-yasgui-web-component".
 */
export class CountQueryResponseEvent {
  public type: EventDataType;
  public response: QueryResponse;

  /**
   * Constructs the model for {@link EventDataType.COUNT_QUERY_RESPONSE} event.
   *
   * @param eventData - event emitted by "ontotext-yasgui-web-component".
   */
  constructor(eventData: EventData) {
    this.type = eventData.type;
    this.response = eventData.payload.response ?? {} as QueryResponse;
  }

  hasResponse() {
    return this.response && this.response.body;
  }

  getResponseBody() {
    if (this.hasResponse()) {
      return this.response.body;
    }
    return null;
  }

  isResponseNumber() {
    if (this.hasResponse()) {
      return typeof this.response.body === 'number';
    }
    return false;
  }

  isResponseArray() {
    if (this.hasResponse()) {
      return Array.isArray(this.response.body);
    }
    return false;
  }

  getBindings() {
    if (this.hasResponse() && typeof this.response.body !== 'number') {
      return this.response.body.results.bindings;
    }
    return null;
  }

  hasBindingResponse() {
    if (this.hasResponse() && typeof this.response.body !== 'number') {
      return this.response.body.results.bindings[0];
    }
    return false;
  }

  setTotalElements(totalElements) {
    if (this.hasResponse() && typeof this.response.body !== 'number') {
      this.response.body.totalElements = totalElements;
    }
  }
}
