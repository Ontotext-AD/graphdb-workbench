/**
 * Configuration model for the graphql playground directive.
 */
export class GraphqlPlaygroundConfig {
    constructor(data) {
        /**
         * @type {string}
         * @private
         */
        this._endpoint = data.endpoint;
        /**
         * @type {Object}
         * @private
         */
        this._headers = data.headers;
    }

    get endpoint() {
        return this._endpoint;
    }

    set endpoint(value) {
        this._endpoint = value;
    }

    get headers() {
        return this._headers;
    }

    set headers(value) {
        this._headers = value;
    }
}
