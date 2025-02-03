export class GraphList {
    /**
     * @type {Graph[]}
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

export class Graph {
    /**
     * @type {string}
     * @private
     */
    _uri = '';

    constructor(data) {
        this._uri = data.uri || '';
    }

    get uri() {
        return this._uri;
    }

    set uri(data) {
        this._uri = data;
    }
}
