export class GraphqlEndpointInfo {
    constructor(data) {
        /**
         * @type {string} - The internal ID of the endpoint.
         * @private
         */
        this._id = data.id;
        /**
         * @type {string} - The ID of the endpoint, like "/graphql/swapi/".
         * @private
         */
        this._endpointId = data.endpointId;
        /**
         * @type {string} - The URI of the endpoint, like "http://swapi.dev/graphql/".
         * @private
         */
        this._endpointURI = data.endpointURI;
        /**
         * @type {string} - The label of the endpoint.
         * @private
         */
        this._label = data.label;
        /**
         * @type {string} - The description of the endpoint.
         * @private
         */
        this._description = data.description;
        /**
         * @type {boolean} - Indicates if the endpoint is the default one.
         * @private
         */
        this._default = data.default;
        /**
         * @type {boolean} - Indicates if the endpoint is active.
         * @private
         */
        this._active = data.active;
        /**
         * @type {string} - The last modified date of the endpoint.
         * @private
         */
        this._lastModified = data.lastModified;
        /**
         * @type {number} - The count of objects in the schema definition describing the endpoint.
         * @private
         */
        this._objectsCount = data.objectsCount;
        /**
         * @type {number} - The count of properties in the schema definition describing the endpoint.
         * @private
         */
        this._propertiesCount = data.propertiesCount;
        /**
         * @type {string[]} - The list of warnings occurred during the endpoint creation.
         * @private
         */
        this._warnings = data.warnings;
        /**
         * @type {string[]} - The list of errors occurred during the endpoint creation.
         * @private
         */
        this._errors = data.errors;
        /**
         * @type {string} - The status of the endpoint.
         * @private
         */
        this._status = data.status;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
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

    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value;
    }

    get description() {
        return this._description;
    }

    set description(value) {
        this._description = value;
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

    get lastModified() {
        return this._lastModified;
    }

    set lastModified(value) {
        this._lastModified = value;
    }

    get objectsCount() {
        return this._objectsCount;
    }

    set objectsCount(value) {
        this._objectsCount = value;
    }

    get propertiesCount() {
        return this._propertiesCount;
    }

    set propertiesCount(value) {
        this._propertiesCount = value;
    }

    get warnings() {
        return this._warnings;
    }

    set warnings(value) {
        this._warnings = value;
    }

    get errors() {
        return this._errors;
    }

    set errors(value) {
        this._errors = value;
    }

    get status() {
        return this._status;
    }

    set status(value) {
        this._status = value;
    }
}

export class GraphqlEndpointsInfoList {
    constructor(endpoints) {
        /**
         * @type {GraphqlEndpointInfo[]} - The original list of endpoints that should remain unchanged.
         * @private
         */
        this._originalEndpointsList = endpoints || [];
        /**
         * @type {GraphqlEndpointInfo[]} - The filtered list of endpoints.
         * @private
         */
        this._endpoints = endpoints || [];
    }

    /**
     * Filters the endpoints by the given term.
     * @param {string} filterTerm - The term to filter by.
     */
    filter(filterTerm) {
        this._endpoints = this._originalEndpointsList
            .filter((endpoint) => {
                return endpoint.endpointId.toLowerCase().includes(filterTerm.toLowerCase()) ||
                    endpoint.label.toLowerCase().includes(filterTerm.toLowerCase());
            });
    }

    get endpoints() {
        return this._endpoints;
    }

    set endpoints(value) {
        this._endpoints = value;
    }
}
