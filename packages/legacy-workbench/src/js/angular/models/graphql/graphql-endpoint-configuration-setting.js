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
     * @type {DynamicFormModel}
     * @private
     */
    _settings;

    /**
     * Flag indicating if the settings are present.
     * @private
     */
    _hasSettings;

    constructor(data) {
        this._settings = data;
        this._hasSettings = this._settings ? this._settings.models.length > 0 : false;
    }

    /**
     * Returns a flat JSON representation of the settings where the keys are the setting keys and the values are the
     * setting values.
     * @returns {Object.<string, *>}
     */
    toFlatJSON() {
        const settings = {};

        const processField = (field) => {
            if (field.collection) {
                settings[field.key] = field.value;
            } else if (field.type === 'select') {
                settings[field.key] = field.value.value;
            } else {
                settings[field.key] = field.value;
            }
            // JSON type field value is string, and the backend doesn't expect it to be parsed, so we send it as is
        };

        this._settings.models.forEach((model) => {
            if (model instanceof DynamicFormField) {
                processField(model);
            } else {
                // Process both visible and hidden fields
                [...model.fields, ...model.hiddenFields].forEach(processField);
            }
        });

        return settings;
    }

    get hasSettings() {
        return this._hasSettings;
    }

    get settings() {
        return this._settings;
    }

    set settings(value) {
        this._settings = value;
        this._hasSettings = this._settings.models.length > 0;
    }
}
