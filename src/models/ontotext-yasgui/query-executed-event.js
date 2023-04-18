/**
 * Model for event of type {@link EventDataType.QUERY_EXECUTED} emitted by "ontotext-yasgui-web-component".
 */
export class QueryExecutedEvent {
    /**
     * Constructs the model for {@link EventDataType.QUERY_EXECUTED} event.
     *
     * @param {EventData} eventData - event emitted by "ontotext-yasgui-web-component".
     */
    constructor(eventData) {
        this.TYPE = eventData.TYPE;
        this.duration = eventData.payload.duration;
        this.tabId = eventData.payload.tabId;
    }
}
