
/**
 * Model for event of type {@link EventDataType.REQUEST_ABORTED} emitted by "ontotext-yasgui-web-component".
 */
export class RequestAbortedEvent {

    /**
     * Constructs the model for {@link EventDataType.REQUEST_ABORTED} event.
     *
     * @param {EventData} eventData - event emitted by "ontotext-yasgui-web-component".
     */
    constructor(eventData) {
        this.TYPE = eventData.TYPE;
        this.request = eventData.payload.request;
        this.queryMode = eventData.payload.queryMode;
    }
    getQueryTrackAlias() {
        if (this.request) {
            return this.request.header['X-GraphDB-Track-Alias'];
        }
    }
    getRepository() {
        if (this.request) {
            const url = this.request.url;
            return url.substring(url.lastIndexOf('/') + 1);
        }
    }
}
