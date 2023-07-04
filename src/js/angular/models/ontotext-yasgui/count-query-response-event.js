import {isNumber} from "lodash";

/**
 * Model for event of type {@link EventDataType.COUNT_QUERY_RESPONSE} emitted by "ontotext-yasgui-web-component".
 */
export class CountQueryResponseEvent {

    /**
     * Constructs the model for {@link EventDataType.COUNT_QUERY_RESPONSE} event.
     *
     * @param {EventData} eventData - event emitted by "ontotext-yasgui-web-component".
     */
    constructor(eventData) {
        this.TYPE = eventData.TYPE;
        this.response = eventData.payload.response;
    }

    hasResponse() {
        return this.response && this.response.body;
    }

    getResponseBody() {
        if (this.hasResponse()) {
            return this.response.body;
        }
    }

    isResponseNumber() {
        if (this.hasResponse()) {
            return isNumber(this.response.body);
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
        if (this.hasResponse()) {
            return this.response.body.results.bindings;
        }
    }

    hasBindingResponse() {
        if (this.hasResponse()) {
            return this.response.body.results.bindings[0];
        }
        return false;
    }

    setTotalElements(totalElements) {
        this.response.body.totalElements = totalElements;
    }
}
