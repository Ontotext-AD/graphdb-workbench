export class UpdateEndpointRequest {
    /**
     * @type {string}
     * @private
     */
    _id;
    /**
     * @type {string}
     * @private
     */
    _label;
    /**
     * @type {string}
     * @private
     */
    _description;
    /**
     * @type {boolean}
     * @private
     */
    _active;
    /**
     * @type {boolean}
     * @private
     */
    _default;
    /**
     * @type {GraphqlEndpointConfigurationSettings}
     * @private
     */
    _options

    constructor(data) {
        this._id = data.id || '';
        this._label = data.label || '';
        this._description = data.description || '';
        this._active = data.active || false;
        this._default = data.default || false;
        this._options = data.options;
    }

    toJSON() {
        return {
            id: this.id,
            label: this.label,
            description: this.description,
            active: this.active,
            default: this.default,
            options: this.options.toFlatJSON()
        };
    }

    set id(value) {
        this._id = value;
    }

    get id() {
        return this._id;
    }

    set label(value) {
        this._label = value;
    }

    get label() {
        return this._label;
    }

    set description(value) {
        this._description = value;
    }

    get description() {
        return this._description;
    }

    set active(value) {
        this._active = value;
    }

    get active() {
        return this._active;
    }

    set default(value) {
        this._default = value;
    }

    get default() {
        return this._default;
    }

    set options(value) {
        this._options = value;
    }

    get options() {
        return this._options;
    }
}
