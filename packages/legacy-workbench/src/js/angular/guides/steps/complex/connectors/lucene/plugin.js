const LUCENE_DEFAULT_TITLE = 'guide.step_plugin.connectors-lucene.title';
const LUCENE_CONNECTOR_NAME = 'Lucene';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'connectors-lucene-type-intro',
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-type-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-type-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    connectorName: LUCENE_CONNECTOR_NAME,
                    class: 'connectors-lucene-type-intro',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-connector-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    connectorName: LUCENE_CONNECTOR_NAME,
                    class: 'connectors-lucene',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-expand-lucene',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-expand-connector',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-expand.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    connectorName: LUCENE_CONNECTOR_NAME,
                    class: 'connectors-lucene-expand',
                },
            }];
        },
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
                    parameterName: 'fields',
                },
            }];
        },
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
                    subparameterName: "fieldName",
                },
            }];
        },
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
                    subparameterName: "fieldNameTransform",
                },
            }];
        },
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
                    subparameterName: "propertyChain",
                },
            }];
        },
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
                    subparameterName: "defaultValue",
                },
            }];
        },
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
                    subparameterName: "datatype",
                },
            }];
        },
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
                    subparameterName: "valueFilter",
                },
            }];
        },
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
                    subparameterName: "indexed",
                },
            }];
        },
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
                    subparameterName: "stored",
                },
            }];
        },
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
                    subparameterName: "analyzed",
                },
            }];
        },
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
                    subparameterName: "multivalued",
                },
            }];
        },
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
                    subparameterName: "ignoreInvalidValues",
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene-fields-facet-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-array-subparameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-fields-facet-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-fields-facet-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'fields',
                    subparameterName: "facet",
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene-languages-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-parameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-languages-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-languages-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'languages',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene-types-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-parameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-types-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-types-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'types',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene-value-filter-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-parameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-value-filter-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-value-filter-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'valueFilter',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene-document-filter-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-parameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-document-filter-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-document-filter-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'documentFilter',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene-readonly-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-parameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-readonly-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-readonly-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'readonly',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene-detect-fields-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-parameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-detect-fields-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-detect-fields-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'detectFields',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene-import-graph-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-parameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-import-graph-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-import-graph-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'importGraph',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene-import-file-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-parameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-import-file-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-import-file-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'importFile',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene-skip-initial-indexing-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-parameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-skip-initial-indexing-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-skip-initial-indexing-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'skipInitialIndexing',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene-boost-properties-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-parameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-boost-properties-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-boost-properties-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'boostProperties',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene-strip-markup-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-parameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-strip-markup-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-strip-markup-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'stripMarkup',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene-analyzer-intro',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-parameter-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-analyzer-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-analyzer-intro',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'analyzer',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene-open-view-sparql-query-dialog',
        /**
         * Options:
         * - <b>instanceName</b>: string (required) – the specific instance name of the Lucene connector.
         */
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-open-view-sparql-query-dialog',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-open-view-sparql-query-dialog.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-open-view-sparql-query-dialog',
                    connectorName: LUCENE_CONNECTOR_NAME,
                    parameterName: 'analyzer',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-lucene-view-sparql-dialog-intro',
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-view-sparql-dialog-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucene-view-sparql-dialog-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCENE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-lucene-view-sparql-dialog-intro',
                },
            }];
        },
    },
]);
