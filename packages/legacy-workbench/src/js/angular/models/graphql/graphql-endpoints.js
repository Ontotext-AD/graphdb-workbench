/**
 * Model for a GraphQL endpoint as fetched by the GraphQL service.
 */
export class GraphqlEndpoint {
    constructor(data) {
        /**
         * @type {string}
         * @private
         */
        this._endpointId = data.endpointId;
        /**
         * @type {string}
         * @private
         */
        this._endpointURI = data.endpointURI;
        /**
         * @type {boolean}
         * @private
         */
        this._active = data.active;
        /**
         * @type {boolean}
         * @private
         */
        this._default = data.default;
    }

    get endpointId() {
        return this._endpointId;
    }

    set endpointId(value) {
        this._endpointId = value;
    }

    get endpointURI() {
        return this._endpointURI;
    }

    set endpointURI(value) {
        this._endpointURI = value;
    }

    get default() {
        return this._default;
    }

    set default(value) {
        this._default = value;
    }

    get active() {
        return this._active;
    }

    set active(value) {
        this._active = value;
    }
}

/**
 * Model for a list of GraphQL endpoints.
 */
export class GraphqlEndpointList {
    constructor(endpoints) {
        /**
         * @type {GraphqlEndpoint[]}
         * @private
         */
        this._endpoints = endpoints || [];
    }

    get endpoints() {
        return this._endpoints;
    }

    set endpoints(value) {
        this._endpoints = value;
    }
}
