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

    constructor(data) {
        this._settings = data || [];
    }

    /**
     * Returns a flat JSON representation of the settings where the keys are the setting keys and the values are the
     * setting values.
     * @returns {Object.<string, *>}
     */
    toFlatJSON() {
        return this.settings.reduce((acc, setting) => {
            if (setting.collection) {
                // acc[setting.key] = setting.value.map((item) => item.value);
                // return acc;
                return;
            }
            if (setting.type === 'select') {
                acc[setting.key] = setting.value.value;
                return acc;
            }
            acc[setting.key] = setting.value;
            return acc;
        }, {});
    }

    get settings() {
        return this._settings;
    }

    set settings(value) {
        this._settings = value;
    }
}
