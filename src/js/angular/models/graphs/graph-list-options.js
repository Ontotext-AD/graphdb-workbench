export class GraphListOptions {
    /**
     * @type {GraphOption[]}
     * @private
     */
    _graphList = undefined;

    constructor(data) {
        this._graphList = data || [];
    }

    get graphList() {
        return this._graphList;
    }

    set graphList(data) {
        this._graphList = data;
    }
}

export class GraphOption {
    /**
     * @type {string}
     * @private
     */
    _uri = '';

    /**
     * @type {string}
     * @private
     */
    _id = '';

    /**
     * @type {string}
     * @private
     */
    _label = '';

    constructor(data) {
        this._uri = data.uri || '';
        this._id = data.id || '';
        this._label = data.label || '';
    }

    get uri() {
        return this._uri;
    }

    set uri(data) {
        this._uri = data;
    }

    get id() {
        return this._id;
    }

    set id(data) {
        this._id = data;
    }

    get label() {
        return this._label;
    }

    set label(data) {
        this._label = data;
    }
}
