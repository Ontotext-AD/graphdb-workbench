const LUCENE_DEFAULT_TITLE = 'guide.step_plugin.connectors-lucene-connectors.title';
const LUCENE_CONNECTOR_NAME = 'Lucene';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'connectors-lucene-connectors-intro',
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-connectors-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-connectors-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    connectorName: LUCENE_CONNECTOR_NAME,
                    class: 'connectors-lucene-connectors-intro',
                }
            }];
        }
    },
    {
        guideBlockName: 'connectors-lucene-connector',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-connector-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-connector.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    connectorName: LUCENE_CONNECTOR_NAME,
                    class: 'connectors-lucene-connector',
                }
            }];
        }
    },
    {
        guideBlockName: 'connectors-expand-lucene-connector',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-expand-connector',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-expand-connector.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    connectorName: LUCENE_CONNECTOR_NAME,
                    class: 'connectors-lucene-expand-connector',
                }
            }];
        }
    },
    {
        guideBlockName: 'connectors-lucene-fields-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-parameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-fields-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-fields-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'fields'
                }
            }];
        }
    },
    {
        guideBlockName: 'connectors-lucene-fields-field-name-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-array-subparameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-fields-field-name-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-fields-field-name-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'fields',
                    subparameterName: "fieldName"
                }
            }];
        }
    },
    {
        guideBlockName: 'connectors-lucene-fields-field-name-transform-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-array-subparameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-fields-field-name-transform-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-fields-field-name-transform-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'fields',
                    subparameterName: "fieldNameTransform"
                }
            }];
        }
    },
    {
        guideBlockName: 'connectors-lucene-fields-property-chain-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-array-subparameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-fields-property-chain-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-fields-property-chain-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'fields',
                    subparameterName: "propertyChain"
                }
            }];
        }
    },
    {
        guideBlockName: 'connectors-lucene-fields-default-value-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-array-subparameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-fields-default-value-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-fields-default-value-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'fields',
                    subparameterName: "defaultValue"
                }
            }];
        }
    },
    {
        guideBlockName: 'connectors-lucene-fields-datatype-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-array-subparameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-fields-datatype-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-fields-datatype-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'fields',
                    subparameterName: "datatype"
                }
            }];
        }
    },
    {
        guideBlockName: 'connectors-lucene-fields-value-filter-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-array-subparameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-fields-value-filter-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-fields-value-filter-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'fields',
                    subparameterName: "valueFilter"
                }
            }];
        }
    },
    {
        guideBlockName: 'connectors-lucene-fields-indexed-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-array-subparameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-fields-indexed-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-fields-indexed-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'fields',
                    subparameterName: "indexed"
                }
            }];
        }
    },
    {
        guideBlockName: 'connectors-lucene-fields-stored-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-array-subparameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-fields-stored-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-fields-stored-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'fields',
                    subparameterName: "stored"
                }
            }];
        }
    },
    {
        guideBlockName: 'connectors-lucene-fields-analyzed-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-array-subparameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-fields-analyzed-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-fields-analyzed-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'fields',
                    subparameterName: "analyzed"
                }
            }];
        }
    },
    {
        guideBlockName: 'connectors-lucene-fields-multivalued-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-array-subparameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-fields-multivalued-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-fields-multivalued-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'fields',
                    subparameterName: "multivalued"
                }
            }];
        }
    },
    {
        guideBlockName: 'connectors-lucene-fields-ignore-invalid-values-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-array-subparameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-fields-ignore-invalid-values-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-fields-ignore-invalid-values-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'fields',
                    subparameterName: "ignoreInvalidValues"
                }
            }];
        }
    }
]);
