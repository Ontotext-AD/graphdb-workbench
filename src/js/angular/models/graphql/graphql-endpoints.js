/**
 * Model for a GraphQL endpoint as fetched by the GraphQL service.
 */
export class GraphqlEndpoint {
    constructor(data) {
        /**
         * @type {string}
         * @private
         */
        this._id = data.id;
        /**
         * @type {string}
         * @private
         */
        this._graphql = data.graphql;
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

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get graphql() {
        return this._graphql;
    }

    set graphql(value) {
        this._graphql = value;
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
