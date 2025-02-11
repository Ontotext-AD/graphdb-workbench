/**
 * @typedef {Object} PartialUpdateEndpointRequest
 * @property {string} [id]
 * @property {string} [label]
 * @property {string} [description]
 * @property {boolean} [active]
 * @property {boolean} [default]
 * @property {GraphqlEndpointConfigurationSettings} [options]
 */

/**
 * A class representing the update endpoint request.
 */
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
        this._id = data.id;
        this._label = data.label;
        this._description = data.description;
        this._active = data.active;
        this._default = data.default;
        this._options = data.options;
    }

    getUpdateDefaultEndpointRequest() {
        return {
            default: this.default
        };
    }

    getUpdateEndpointSettingsRequest() {
        return {
            options: this.options ? this.options.toFlatJSON() : null
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
