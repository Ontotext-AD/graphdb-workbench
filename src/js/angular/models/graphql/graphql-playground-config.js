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
    }

    get endpoint() {
        return this._endpoint;
    }

    set endpoint(value) {
        this._endpoint = value;
    }
}
