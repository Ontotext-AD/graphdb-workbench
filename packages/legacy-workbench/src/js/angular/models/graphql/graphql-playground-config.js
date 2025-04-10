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
         * @type {Object | () => Object}
         * @private
         */
        this._headers = data.headers;

        /**
         * A code of selected language. For example "en".
         * @type {string}
         * @private
         */
        this._selectedLanguage = data.selectedLanguage;

        /**
         * The default query that will be used when a new tab is added.
         */
        this._defaultQuery = data.defaultQuery;
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

    get selectedLanguage() {
        return this._selectedLanguage;
    }

    set selectedLanguage(value) {
        this._selectedLanguage = value;
    }

    get defaultQuery() {
        return this._defaultQuery;
    }

    set defaultQuery(value) {
        this._defaultQuery = value;
    }
}
