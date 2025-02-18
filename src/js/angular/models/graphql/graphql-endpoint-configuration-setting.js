import {DynamicFormField} from "../dynamic-form/dynamic-form-field";

/**
 * Enum for configuration types.
 * @readonly
 * @enum {string}
 */
export const CONFIG_TYPE = {
    STRING: 'string',
    TEXT: 'text',
    BOOLEAN: 'boolean',
    JSON: 'json'
}

export class GraphqlEndpointConfigurationSettings {
    /**
     * Endpoint configuration settings model.
     * @type {DynamicFormField[]}
     * @private
     */
    _settings;

    /**
     * Flag indicating if the settings are present.
     * @private
     */
    _hasSettings;

    constructor(data) {
        this._settings = data || [];
        this._hasSettings = this._settings.length > 0;
    }

    /**
     * Returns a flat JSON representation of the settings where the keys are the setting keys and the values are the
     * setting values.
     * @returns {Object.<string, *>}
     */
    toFlatJSON() {
        return this.settings.reduce((acc, setting) => {
            if (setting.collection) {
                acc[setting.key] = setting.value;
                return acc;
            }
            if (setting.type === 'select') {
                acc[setting.key] = setting.value.value;
                return acc;
            }
            acc[setting.key] = setting.value;
            return acc;
        }, {});
    }

    get hasSettings() {
        return this._hasSettings;
    }

    get settings() {
        return this._settings;
    }

    set settings(value) {
        this._settings = value;
        this._hasSettings = this._settings.length > 0;
    }
}
