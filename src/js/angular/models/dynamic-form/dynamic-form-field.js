/**
 * A model representing a dynamic form field used by the dynamic form component.
 */
export class DynamicFormField {
    /**
     * The unique key of the setting.
     * @type {string}
     * @private
     */
    _key = '';
    /**
     * The label displayed for the setting.
     * @type {string}
     * @private
     */
    _label = '';
    /**
     * The type of the field (e.g., string, boolean, select, etc.).
     * @type {string}
     * @private
     */
    _type = '';
    /**
     * Whether the value is a collection.
     * @type {boolean}
     * @private
     */
    _collection = false;
    /**
     * The current value of the setting.
     * @private
     */
    _value;
    /**
     * The possible values (used for select-type fields).
     * @private
     */
    _values;
    /**
     * A regular expression or its string representation for validating the value.
     * @private
     */
    _regex;
    /**
     * Whether the field is required.
     * @type {boolean}
     * @private
     */
    _required = false;

    /**
     * Creates an instance of GraphqlEndpointConfigurationSetting.
     * @param {Object} options - The setting options.
     */
    constructor(options) {
        this._key = options.key;
        this._label = options.label;
        this._type = options.type;
        this._collection = options.collection;
        this._value = options.value;
        this._values = options.values;
        this._regex = typeof options.regex === 'string' ? new RegExp(options.regex) : options.regex;
        this._required = options.required;
    }

    get key() {
        return this._key;
    }

    set key(value) {
        this._key = value;
    }

    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get collection() {
        return this._collection;
    }

    set collection(value) {
        this._collection = value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    get values() {
        return this._values;
    }

    set values(value) {
        this._values = value;
    }

    get regex() {
        return this._regex;
    }

    set regex(value) {
        this._regex = typeof value === 'string' ? new RegExp(value) : value;
    }

    get required() {
        return this._required;
    }

    set required(value) {
        this._required = value;
    }
}
