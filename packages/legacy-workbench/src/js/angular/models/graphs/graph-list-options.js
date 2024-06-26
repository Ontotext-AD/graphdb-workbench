export class GraphListOptions {
    /**
     * @type {GraphOption[]}
     * @private
     */
    _graphList = undefined;
    /**
     * @type {boolean}
     * @private
     */
    _isEmpty;
    /**
     * @type {number}
     * @private
     */
    _size;

    constructor(data) {
        this._graphList = data || [];
        this._isEmpty = this.graphList.length === 0;
        this._size = this.graphList.length;
    }

    getGraphIds() {
        return this.graphList.map(graph => graph.uri);
    }

    /**
     * Process the graph list with the given predicate.
     * @param {function} predicate The predicate to apply to each graph.
     * @returns {GraphOption[]}
     */
    processGraphList(predicate) {
        return this.graphList.map(predicate);
    }

    get size() {
        return this._size;
    }

    get isEmpty() {
        return this._isEmpty;
    }

    get graphList() {
        return this._graphList;
    }

    set graphList(data) {
        this._graphList = data;
        this._isEmpty = this.graphList.length === 0;
        this._size = this.graphList.length;
    }

    toJSON() {
        return this.graphList.map(graph => graph.uri);
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
