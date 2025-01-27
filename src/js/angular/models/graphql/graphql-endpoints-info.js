export class GraphqlEndpointInfo {
    constructor(data) {
        this._id = data.id;
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
         * @type {GraphqlEndpointInfo[]} - The list of endpoints.
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
