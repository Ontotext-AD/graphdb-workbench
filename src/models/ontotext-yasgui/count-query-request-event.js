/**
 * Model for event of type {@link EventDataType.COUNT_QUERY} emitted by "ontotext-yasgui-web-component".
 */
export class CountQueryRequestEvent {

    /**
     * Constructs the model for {@link EventDataType.DOWNLOAD_AS} event.
     *
     * @param {EventData} eventData - event emitted by "ontotext-yasgui-web-component".
     */
    constructor(eventData) {
        this.TYPE = eventData.TYPE;
        this.query = eventData.payload.query;
        this.queryMode = eventData.payload.queryMode;
        this.request = eventData.payload.request;
    }

    setPageSize(pageSize) {
        this.request._data['pageSize'] = pageSize;
    }

    setPageNumber(pageNumber) {
        this.request._data['pageNumber'] = pageNumber;
    }

    setCount(count) {
        this.request._data['count'] = count;
    }
}
