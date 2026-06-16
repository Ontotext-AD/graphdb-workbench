import {EventDataType} from './event-data-type';
import {NumericHolder, QueryResponse, QueryResponseData, TextArrayResponse} from '../query-response';
import {CountQueryResponseEventPayload} from './event-payload';

/**
 * Model for event of type {@link EventDataType.COUNT_QUERY_RESPONSE} emitted by "ontotext-yasgui-web-component".
 */
export class CountQueryResponseEvent {
  public type = EventDataType.COUNT_QUERY_RESPONSE as const;
  public response: QueryResponse;

  /**
   * Constructs the model for {@link EventDataType.COUNT_QUERY_RESPONSE} event.
   *
   * @param eventPayload - event payload emitted by "ontotext-yasgui-web-component" when a count query has been exected.
   * It holds the response of the count query, which must be processed to extract the total number of results.
   */
  constructor(eventPayload: CountQueryResponseEventPayload) {
    this.response = eventPayload.response ?? {} as QueryResponse;
  }

  hasResponse() {
    return this.response.body !== undefined && this.response.body !== null;
  }

  getResponseBody() {
    return this.response.body ?? null;
  }

  isResponseNumber() {
    if (this.hasResponse()) {
      return typeof this.response.body === 'number';
    }
    return false;
  }

  isResponseArray() {
    return Array.isArray(this.response.body);
  }

  getBindings() {
    if (this.isResponseObject(this.response.body)) {
      return this.response.body.results.bindings;
    }
    return null;
  }

  hasBindingResponse() {
    if (this.isResponseObject(this.response.body)) {
      return this.response.body.results.bindings[0];
    }
    return false;
  }

  setTotalElements() {
    if (this.isResponseObject(this.response.body)) {
      const total = this.resolveTotalElements();
      this.response.body.totalElements = total === undefined || total === null ? undefined : String(total);
    }
  }

  private isResponseObject(body: unknown): body is QueryResponseData {
    return body !== null && body !== undefined && typeof body === 'object' && !Array.isArray(body);
  }

  private resolveTotalElements() {
    let totalElements = undefined;
    if (this.isResponseNumber()) {
      totalElements = this.getResponseBody();
    }

    if (this.isResponseArray()) {
      const body = this.getResponseBody() as TextArrayResponse;
      if (body['http://www.ontotext.com/']) {
        totalElements = body['http://www.ontotext.com/']['http://www.ontotext.com/']?.[0]?.value;
      }
    }

    if (this.hasBindingResponse()) {
      const body = this.getResponseBody() as QueryResponseData;
      if (body) {
        const result = body.results.bindings[0] as Record<string, NumericHolder>;
        const vars = body.head.vars;
        const bindingVar = Object.keys(result).find((b) => {
          return vars.includes(b) && !Number.isNaN(result[b].value);
        });
        if (bindingVar) {
          totalElements = result[bindingVar].value;
        }
      }
    }

    return totalElements;
  }
}
