export class EndpointGenerationReportList {
    /**
     * @type {EndpointGenerationReport[]}
     * @private
     */
    _reports;

    constructor(data) {
        this._reports = data || [];
    }

    get reports() {
        return this._reports;
    }

    set reports(value) {
        this._reports = value;
    }
}

export class EndpointGenerationReport {
    /**
     * A unique identifier for the GraphQL endpoint, matching the SOML ID.
     * @type {string}
     * @private
     */
    _id;
    /**
     * A user-friendly identifier used for visualization.
     * @type {string}
     * @private
     */
    _endpointId;
    /**
     * The relative path to access the GraphQL endpoint.
     * @type {string}
     * @private
     */
    _endpointURI;
    /**
     * Indicates whether the endpoint is currently active.
     * @type {boolean}
     * @private
     */
    _active;
    /**
     * Specifies if this is the default endpoint for the repository.
     * @type {boolean}
     * @private
     */
    _default;
    /**
     * A user-friendly name for the endpoint.
     * @type {string}
     * @private
     */
    _label;
    /**
     * A description of the endpoint.
     * @type {string}
     * @private
     */
    _description;
    /**
     * The last modification date of the endpoint in format: yyyy-MM-dd
     * @type {string}
     * @private
     */
    _lastModified;
    /**
     * The number of objects in the GraphQL schema.
     * @type {number}
     * @private
     */
    _objectsCount;
    /**
     * The number of properties in the GraphQL schema.
     * @type {number}
     * @private
     */
    _propertiesCount;
    /**
     * The total number of warnings in the schema validation.
     * @type {number}
     * @private
     */
    _warnings;
    /**
     * The total number of errors in the schema validation.
     * @type {number}
     * @private
     */
    _errors;
    /**
     * A detailed breakdown of warnings and errors.
     * @type {string[]}
     * @private
     */
    _messages;
    /**
     * Indicates whether the endpoint was created successfully. No errors are found and the endpoint is active.
     * @type {boolean}
     * @private
     */
    _createdSuccessfully;

    constructor(data) {
        this._id = data.id || '';
        this._endpointId = data.endpointId || '';
        this._endpointURI = data.endpointURI || '';
        this._active = data.active || false;
        this._default = data.default || false;
        this._label = data.label || '';
        this._description = data.description || '';
        this._lastModified = data.lastModified || '';
        this._objectsCount = data.objectsCount || 0;
        this._propertiesCount = data.propertiesCount || 0;
        this._warnings = data.warnings || 0;
        this._errors = data.errors || 0;
        this._messages = data.messages || [];
        this._createdSuccessfully = this._active && this._errors === 0;
    }

    toJSON() {
        return {
            id: this._id,
            endpointId: this._endpointId,
            endpointURI: this._endpointURI,
            active: this._active,
            default: this._default,
            label: this._label,
            description: this._description,
            lastModified: this._lastModified,
            objectsCount: this._objectsCount,
            propertiesCount: this._propertiesCount,
            warnings: this._warnings,
            errors: this._errors,
            messages: this._messages
        };
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

    get active() {
        return this._active;
    }

    set active(value) {
        this._active = value;
    }

    get default() {
        return this._default;
    }

    set default(value) {
        this._default = value;
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

    get messages() {
        return this._messages;
    }

    set messages(value) {
        this._messages = value;
    }

    get createdSuccessfully() {
        return this._createdSuccessfully;
    }

    set createdSuccessfully(value) {
        this._createdSuccessfully = value;
    }
}
