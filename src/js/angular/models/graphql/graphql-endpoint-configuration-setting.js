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

    get settings() {
        return this._settings;
    }

    set settings(value) {
        this._settings = value;
    }

    toJSON() {
        return this.settings.map((config) => {
            return {
                key: config.key,
                value: config.value,
            }
        })
    }
}
