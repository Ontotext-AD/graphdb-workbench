
/**
 * Model for event of type {@link EventDataType.COUNT_QUERY_ABORTED} emitted by "ontotext-yasgui-web-component".
 */
export class CountQueryAbortedEvent {

    /**
     * Constructs the model for {@link EventDataType.COUNT_QUERY_ABORTED} event.
     *
     * @param {EventData} eventData - event emitted by "ontotext-yasgui-web-component".
     */
    constructor(eventData) {
        this.TYPE = eventData.TYPE;
        this.request = eventData.payload;
    }
    getQueryTrackAlias() {
        if (this.request && this.request.response) {
            return this.request.response.header['X-GraphDB-Track-Alias'];
        }
    }
    getRepository() {
        if (this.request && this.request.response) {
            const url = this.request.response.url;
            return url.substring(url.lastIndexOf('/') + 1);
        }
    }
}
