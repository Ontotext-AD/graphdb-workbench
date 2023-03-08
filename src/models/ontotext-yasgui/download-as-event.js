/**
 * Model for event of type {@link EventDataType.DOWNLOAD_AS} emitted by "ontotext-yasgui-web-component".
 */
export class DownloadAsEvent {

    /**
     * Constructs the model for {@link EventDataType.DOWNLOAD_AS} event.
     *
     * @param {EventData} eventData - event emitted by "ontotext-yasgui-web-component".
     */
    constructor(eventData) {
        this.TYPE = eventData.TYPE;
        this.contentType = eventData.payload.value;
        this.pluginName = eventData.payload.pluginName;
        this.query = eventData.payload.query;
        this.infer = eventData.payload.infer;
        this.sameAs = eventData.payload.sameAs;
    }
}
