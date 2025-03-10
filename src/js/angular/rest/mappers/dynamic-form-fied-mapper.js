import {FIELD_TYPE} from "../../core/directives/dynamic-form/dynamic-form.directive";
import {SelectMenuOptionsModel} from "../../models/form-fields";
import {DynamicFormField} from "../../models/dynamic-form/dynamic-form-field";
import {CONFIG_TYPE} from "../../models/graphql/graphql-endpoint-configuration-setting";
import {DynamicFormGroup, DynamicFormModel} from "../../models/dynamic-form/dynamic-form-model";

/**
 * Maps the dynamic form data to the dynamic form model.
 * @param {*} data - The dynamic form data.
 * @returns {DynamicFormModel}
 */
export const dynamicFormModelMapper = (data) => {
    if (!data || !data.configs) {
        return new DynamicFormModel();
    }
    const fields = buildFieldModels(data.configs);
    return buildFormModel(fields);
};

/**
 * Builds the form model from the fields.
 * @param {DynamicFormField[]} fields
 * @returns {DynamicFormModel}
 */
const buildFormModel = (fields) => {
    const models = [];
    fields.forEach((field) => {
        if (!field.group) {
            models.push(field);
            return;
        }

        let group = models.find((model) => model.groupId === field.group);
        if (!group) {
            group = new DynamicFormGroup({groupId: field.group});
            models.push(group);
        }

        const targetCollection = field.hidden ? group.hiddenFields : group.fields;
        targetCollection.push(field);
    });
    return new DynamicFormModel(models);
}

const buildFieldModels = (configs) => {
    return configs.map((config) => {
        let type = resolveType(config);
        let mappedValues = config.values;
        let selectedValue = [];

        if (type === FIELD_TYPE.MULTI_SELECT || type === FIELD_TYPE.SELECT) {
            mappedValues = mappedValues.map((option) => {
                const isSelected =
                    (Array.isArray(config.value) && config.value.indexOf(option) > -1) ||
                    (typeof config.value === 'string' && config.value === option);

                const menuOption = new SelectMenuOptionsModel({
                    label: option,
                    value: option,
                    selected: isSelected
                });

                if (isSelected) {
                    selectedValue.push(menuOption);
                }
                return menuOption;
            });

            if (type === FIELD_TYPE.SELECT) {
                config.value = selectedValue[0] ? selectedValue[0] : [];
            } else if (type === FIELD_TYPE.MULTI_SELECT) {
                config.value = selectedValue;
            }
        }
        return dynamicFormFieldMapper(config, type, mappedValues);
    });
}

const dynamicFormFieldMapper = (config, type, mappedValues) => {
    return new DynamicFormField({
        key: config.key,
        label: config.label,
        description: config.description,
        type: type,
        collection: config.collection || false,
        value: config.value,
        values: mappedValues,
        regex: config.regex,
        required: config.required || false,
        group: config.group,
        hidden: config.hidden
    });
};

const resolveType = (config) => {
    let type;
    if(config.type === CONFIG_TYPE.TEXT) {
        type = FIELD_TYPE.TEXT;
    } else if (config.type === CONFIG_TYPE.BOOLEAN) {
        type = FIELD_TYPE.BOOLEAN;
    } else if (config.type === CONFIG_TYPE.JSON) {
        type = FIELD_TYPE.JSON;
    } else if (config.type === CONFIG_TYPE.STRING) {
        if (config.values && config.values.length > 0) {
            type = config.collection ? FIELD_TYPE.MULTI_SELECT : FIELD_TYPE.SELECT;
        } else {
            type = FIELD_TYPE.STRING;
        }
    }
    return type;
};
