import {GraphqlSchemaShapes} from "./graphql-schema-shapes";
import {GraphListOptions} from "../graphs/graph-list-options";

export class GraphqlEndpointConfiguration {
    /**
     * @type {GraphqlSchemaShapes}
     */
    _selectedGraphqlSchemaShapes;
    /**
     * @type {GraphListOptions}
     * @private
     */
    _selectedGraphs;
    /**
     * @type {GraphqlEndpointParams}
     * @private
     */
    _params;
    _graphqlShapes = [];

    constructor() {
        this._selectedGraphqlSchemaShapes = new GraphqlSchemaShapes();
        this._selectedGraphs = new GraphListOptions();
        this._params = new GraphqlEndpointParams({});
    }

    get selectedGraphs() {
        return this._selectedGraphs;
    }

    set selectedGraphs(value) {
        this._selectedGraphs = value;
    }

    get params() {
        return this._params;
    }

    set params(value) {
        this._params = value;
    }

    get selectedGraphqlSchemaShapes() {
        return this._selectedGraphqlSchemaShapes;
    }

    set selectedGraphqlSchemaShapes(value) {
        this._selectedGraphqlSchemaShapes = value;
    }
}

export class GraphqlEndpointParams {
    /**
     * @type {string}
     * @private
     */
    _endpointId;
    /**
     * @type {string}
     * @private
     */
    _endpointLabel;
    /**
     * @type {string}
     * @private
     */
    _vocPrefix;

    constructor(data) {
        this._endpointId = data.endpointId || '';
        this._endpointLabel = data.endpointLabel || '';
        this._vocPrefix = data.vocPrefix || '';
    }

    get endpointId() {
        return this._endpointId;
    }

    set endpointId(value) {
        this._endpointId = value;
    }

    get endpointLabel() {
        return this._endpointLabel;
    }

    set endpointLabel(value) {
        this._endpointLabel = value;
    }

    get vocPrefix() {
        return this._vocPrefix;
    }

    set vocPrefix(value) {
        this._vocPrefix = value;
    }
}
