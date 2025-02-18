import {UpdateEndpointRequest} from "./update-endpoint-request";

export class GraphqlEndpointInfo {
    /**
     * @type {string} - The ID of the endpoint, like "swapi".
     * @private
     */
    _endpointId;
    /**
     * @type {string} - The URI of the endpoint, like "http://swapi.dev/graphql/".
     * @private
     */
    _endpointURI;
    /**
     * @type {string} - The label of the endpoint.
     * @private
     */
    _label;
    /**
     * @type {string} - The description of the endpoint.
     * @private
     */
    _description;
    /**
     * @type {boolean} - Indicates if the endpoint is the default one.
     * @private
     */
    _default;
    /**
     * @type {boolean} - Indicates if the endpoint is active.
     * @private
     */
    _active;
    /**
     * @type {string} - The last modified date of the endpoint.
     * @private
     */
    _lastModified;
    /**
     * @type {number} - The count of objects in the schema definition describing the endpoint.
     * @private
     */
    _objectsCount;
    /**
     * @type {number} - The count of properties in the schema definition describing the endpoint.
     * @private
     */
    _propertiesCount;
    /**
     * @type {string[]} - The list of warnings occurred during the endpoint creation.
     * @private
     */
    _warnings;
    /**
     * @type {string[]} - The list of errors occurred during the endpoint creation.
     * @private
     */
    _errors;

    /**
     * @type {boolean} - Indicates if the endpoint was created successfully
     * @private
     */
    _createdSuccessfully;

    constructor(data) {
        this._endpointId = data.endpointId;
        this._endpointURI = data.endpointURI;
        this._label = data.label;
        this._description = data.description;
        this._default = data.default;
        this._active = data.active;
        this._lastModified = data.lastModified;
        this._objectsCount = data.objectsCount;
        this._propertiesCount = data.propertiesCount;
        this._warnings = data.warnings;
        this._errors = data.errors;
        this._createdSuccessfully = this._active && this._errors === 0;
    }

    /**
     * Converts the endpoint info to an update endpoint request.
     * @param {GraphqlEndpointConfigurationSettings} endpointSettings - The endpoint settings.
     * @returns {UpdateEndpointRequest}
     */
    toUpdateEndpointRequest(endpointSettings) {
        return new UpdateEndpointRequest({
            id: this.endpointId,
            label: this.label,
            description: this.description,
            active: this.active,
            default: this.default,
            options: endpointSettings
        });
    }

    get createdSuccessfully() {
        return this._createdSuccessfully;
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
}

export class GraphqlEndpointsInfoList {
    /**
     * @type {GraphqlEndpointInfo[]} - The original list of endpoints that should remain unchanged.
     * @private
     */
    _originalEndpointsList;
    /**
     * @type {GraphqlEndpointInfo[]} - The filtered list of endpoints.
     * @private
     */
    _endpoints;

    constructor(endpoints) {
        this._originalEndpointsList = endpoints || [];
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
