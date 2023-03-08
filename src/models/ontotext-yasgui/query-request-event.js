/**
 * Model for event of type {@link EventDataType.QUERY} emitted by "ontotext-yasgui-web-component".
 */
export class QueryRequestEvent {

    /**
     * Constructs the model for {@link EventDataType.QUERY} event.
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

    getPageSize() {
        return this.request._data['pageSize'] ? parseInt(this.request._data['pageSize']) : undefined;
    }

    setPageNumber(pageNumber) {
        this.request._data['pageNumber'] = pageNumber;
    }

    getPageNumber() {
        return this.request._data['pageNumber'] ? parseInt(this.request._data['pageNumber']) : undefined;
    }

    setOffset(offset) {
        this.request._data['offset'] = offset;
    }

    setLimit(limit) {
        this.request._data['limit'] = limit;
    }
}
