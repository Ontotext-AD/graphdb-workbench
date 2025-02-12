export const ENDPOINT_GENERATION_STATUS = {
    NONE: 'NONE',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
};

export class GraphqlEndpointOverviewList {
    /**
     * @type {GraphqlEndpointOverview[]}
     * @private
     */
    _endpointList = [];

    constructor(data) {
        this._endpointList = data || [];
    }

    get endpointList() {
        return this._endpointList;
    }

    set endpointList(value) {
        this._endpointList = value;
    }
}

export class GraphqlEndpointOverview {
    /**
     * @type {string}
     * @private
     */
    _label;

    /**
     * @type {string}
     * @private
     */
    _status;

    constructor(data) {
        this._label = data.label || '';
        this._status = data.status || ENDPOINT_GENERATION_STATUS.NONE;
    }

    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value;
    }

    get status() {
        return this._status;
    }

    set status(value) {
        this._status = value;
    }
}
