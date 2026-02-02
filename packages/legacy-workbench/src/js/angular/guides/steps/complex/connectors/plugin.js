const CONNECTORS_DEFAULT_TITLE = 'menu.connectors.label';

const getConnectorNameSelector = (options, services) => {
    return services.GuideUtils.getGuideElementSelector(`connector-name-${options.connectorName}`);
};

const getConnectorContentSelector = (options, services) => {
    return services.GuideUtils.getGuideElementSelector(`${options.instanceName}-connector-content`);
};

const getConnectorParameterSelector = (options, services) => {
    return services.GuideUtils.getGuideElementSelector(`${options.parameterName}-connector-parameter`);
};

const getConnectorSubparameterSelector = (options, services) => {
    return services.GuideUtils.getGuideElementSelector(`${options.subparameterName}-connector-subproperty`);
};

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'connectors-intro',
        getSteps: (options) => {
            return [{
                guideBlockName: 'info-message',
                options: {
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: CONNECTORS_DEFAULT_TITLE}),
                    placement: 'top',
                    class: 'connectors-connectors-intro',
                    content: 'guide.step_plugin.connectors-connectors-intro.content',
                    ...options,
                    url: 'connectors',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-type-intro',
        /**
         * Options:
         * - <b>connectorName</b>: string (required).
         *   <ol>Possible values:
         *    <li>Elasticsearch</li>
         *    <li>OpenSearch</li>
         *    <li>Solr</li>
         *    <li>Lucene</li>
         *    <li>Kafka</li>
         *    <li>ChatGPT-Retrieval</li>
         *   </ol>
         *
         *   Must override content with connector specific content
         */
        getSteps: (options, services) => {
            return [{
                guideBlockName: 'read-only-element',
                options: {
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: CONNECTORS_DEFAULT_TITLE}),
                    placement: 'top',
                    class: 'connectors-connectors-intro',
                    content: 'guide.step_plugin.connectors-type-intro.content',
                    ...options,
                    elementSelector: getConnectorNameSelector(options, services),
                    url: 'connectors',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-connector-intro',
        /**
         * Options:
         * - <b>connectorName</b>: string (required).
         *   <ol>Possible values:
         *    <li>Elasticsearch</li>
         *    <li>OpenSearch</li>
         *    <li>Solr</li>
         *    <li>Lucene</li>
         *    <li>Kafka</li>
         *    <li>ChatGPT-Retrieval</li>
         *   </ol>
         * - <b>instanceName</b>: string (required) – the specific connector instance name for <code>connectorName</code>.
         */
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const connectorNameSelector = getConnectorNameSelector(options, services);
            const connectorCardSelector = GuideUtils.getGuideElementSelector(`${options.instanceName}-connector-card`);
            return [{
                guideBlockName: 'read-only-element',
                options: {
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: CONNECTORS_DEFAULT_TITLE}),
                    placement: 'top',
                    class: 'connectors-connector-intro',
                    content: 'guide.step_plugin.connectors-connector-intro.content',
                    ...options,
                    elementSelector: `${connectorNameSelector} ${connectorCardSelector}`,
                    url: 'connectors',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-expand-connector',
        /**
         * Options:
         * - <b>connectorName</b>: string (required).
         *   <ol>Possible values:
         *    <li>Elasticsearch</li>
         *    <li>OpenSearch</li>
         *    <li>Solr</li>
         *    <li>Lucene</li>
         *    <li>Kafka</li>
         *    <li>ChatGPT-Retrieval</li>
         *   </ol>
         * - <b>instanceName</b>: string (required) – the specific connector instance name for <code>connectorName</code>.
         */
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const connectorNameSelector = getConnectorNameSelector(options, services);
            const connectorToggleButtonSelector = GuideUtils.getGuideElementSelector(`${options.instanceName}-connector-toggle-button`, 'a');
            return [{
                guideBlockName: 'clickable-element',
                options: {
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: CONNECTORS_DEFAULT_TITLE}),
                    placement: 'top',
                    class: 'connectors-expand-connector',
                    content: 'guide.step_plugin.connectors-expand-connector.content',
                    ...options,
                    elementSelector: `${connectorNameSelector} ${connectorToggleButtonSelector}`,
                    url: 'connectors',
                    onNextClick: () => {
                        GuideUtils.clickOnElement(`${connectorNameSelector} ${connectorToggleButtonSelector}`)();
                    },
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-parameter-intro',
        /**
         * Options:
         * - <b>connectorName</b>: string (required).
         *   <ol>Possible values:
         *    <li>Elasticsearch</li>
         *    <li>OpenSearch</li>
         *    <li>Solr</li>
         *    <li>Lucene</li>
         *    <li>Kafka</li>
         *    <li>ChatGPT-Retrieval</li>
         *   </ol>
         * - <b>instanceName</b>: string (required) – the specific connector instance name for <code>connectorName</code>.
         * - <b>parameterName</b>: string (required) – the specific creation parameters name for <code>instanceName</code>.
         */
        getSteps: (options, services) => {
            const connectorNameSelector = getConnectorNameSelector(options, services);
            const connectorContentSelector = getConnectorContentSelector(options, services);
            const parameterSelector = getConnectorParameterSelector(options, services);
            return [{
                guideBlockName: 'read-only-element',
                options: {
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: CONNECTORS_DEFAULT_TITLE}),
                    placement: 'top',
                    class: 'connectors-connector-intro',
                    content: 'guide.step_plugin.connectors-parameter-intro.content',
                    ...options,
                    elementSelector: `${connectorNameSelector} ${connectorContentSelector} ${parameterSelector}`,
                    url: 'connectors',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-parameter-fields-remaining-fields-intro',
        /**
         * Options:
         * - <b>connectorName</b>: string (required).
         *   <ol>Possible values:
         *    <li>Elasticsearch</li>
         *    <li>OpenSearch</li>
         *    <li>Solr</li>
         *    <li>Lucene</li>
         *    <li>Kafka</li>
         *    <li>ChatGPT-Retrieval</li>
         *   </ol>
         * - <b>instanceName</b>: string (required) – the specific connector instance name for <code>connectorName</code>.
         * - <b>parameterName</b>: string (required) – the specific creation parameter name for <code>instanceName</code>.
         */
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const remainingFieldsSelector = GuideUtils.getGuideElementSelector('connector-remaining-fieldsets');
            const connectorNameSelector = getConnectorNameSelector(options, services);
            const connectorContentSelector = getConnectorContentSelector(options, services);
            const parameterSelector = getConnectorParameterSelector(options, services);

            return [{
                guideBlockName: 'read-only-element',
                options: {
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: CONNECTORS_DEFAULT_TITLE}),
                    placement: 'top',
                    class: 'connectors-remaining-fieldsets-intro',
                    content: 'guide.step_plugin.connectors-parameter-fields-remaining-fields-intro.content',
                    ...options,
                    elementSelector: `${connectorNameSelector} ${connectorContentSelector} ${parameterSelector} ${remainingFieldsSelector}`,
                    url: 'connectors',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-array-subparameter-intro',
        /**
         * Options:
         * - <b>connectorName</b>: string (required).
         *   <ol>Possible values:
         *    <li>Elasticsearch</li>
         *    <li>OpenSearch</li>
         *    <li>Solr</li>
         *    <li>Lucene</li>
         *    <li>Kafka</li>
         *    <li>ChatGPT-Retrieval</li>
         *   </ol>
         * - <b>instanceName</b>: string (required) – the specific connector instance name for <code>connectorName</code>.
         * - <b>parameterName</b>: string (required) – the specific creation parameter name for <code>instanceName</code>.
         * - <b>subparameterName</b>: string (required) – the specific creation subparameter name for <code>parameterName</code>.
         */
        getSteps: (options, services) => {
            const connectorNameSelector = getConnectorNameSelector(options, services);
            const connectorContentSelector = getConnectorContentSelector(options, services);
            const parameterSelector = getConnectorParameterSelector(options, services);
            const subparameterName = getConnectorSubparameterSelector(options, services);
            return [{
                guideBlockName: 'read-only-element',
                options: {
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: CONNECTORS_DEFAULT_TITLE}),
                    placement: 'top',
                    class: 'connectors-connector-intro',
                    content: 'guide.step_plugin.connectors-array-subparameter-intro.content',
                    ...options,
                    elementSelector: `${connectorNameSelector} ${connectorContentSelector} ${parameterSelector} ${subparameterName}`,
                    url: 'connectors',
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-open-view-sparql-query-dialog',
        /**
         * Options:
         * - <b>connectorName</b>: string (required).
         *   <ol>Possible values:
         *    <li>Elasticsearch</li>
         *    <li>OpenSearch</li>
         *    <li>Solr</li>
         *    <li>Lucene</li>
         *    <li>Kafka</li>
         *    <li>ChatGPT-Retrieval</li>
         *   </ol>
         * - <b>instanceName</b>: string (required) – the specific connector instance name for <code>connectorName</code>.
         */
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const connectorNameSelector = getConnectorNameSelector(options, services);
            const connectorContentSelector = getConnectorContentSelector(options, services);
            const openViewSPARQLDialogSelector = GuideUtils.getGuideElementSelector('open-view-sparql-query-dialog');
            const elementSelector = `${connectorNameSelector} ${connectorContentSelector} ${openViewSPARQLDialogSelector}`;
            return [{
                guideBlockName: 'clickable-element',
                options: {
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: CONNECTORS_DEFAULT_TITLE}),
                    placement: 'top',
                    class: 'open-view-sparql-query-dialog',
                    content: 'guide.step_plugin.connectors-open-view-sparql-query-dialog.content',
                    ...options,
                    elementSelector,
                    url: 'connectors',
                    onNextClick: () => {
                        GuideUtils.clickOnElement(elementSelector)();
                    },
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-close-view-sparql-query-dialog',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const elementSelector = GuideUtils.getGuideElementSelector('close-view-query-dialog');
            return [{
                guideBlockName: 'clickable-element',
                options: {
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: CONNECTORS_DEFAULT_TITLE}),
                    placement: 'top',
                    class: 'connectors-close-view-sparql-query-dialog',
                    content: 'guide.step_plugin.connectors-close-view-sparql-query-dialog.content',
                    ...options,
                    elementSelector,
                    url: 'connectors',
                    onNextClick: () => {
                        GuideUtils.clickOnElement(elementSelector)();
                    },
                },
            }];
        },
    },
    {
        guideBlockName: 'connectors-view-sparql-dialog-intro',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const paddingBottomClass = 'padding-bottom-8';
            const modalContent = '.modal-content';

            return [{
                guideBlockName: 'scroll-only-element',
                options: {
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: CONNECTORS_DEFAULT_TITLE}),
                    class: 'connectors-view-sparql-dialog-intro',
                    content: 'guide.step_plugin.connectors-view-sparql-dialog-intro.content',
                    ...options,
                    elementSelectorToWait: GuideUtils.getGuideElementSelector('view-query-body'),
                    elementSelector: GuideUtils.getGuideElementSelector('view-query-body'),
                    url: 'connectors',
                    show: () => () => {
                        document.querySelector(modalContent)?.classList.add(paddingBottomClass);
                    },
                    hide: () => () => {
                        document.querySelector(modalContent)?.classList.remove(paddingBottomClass);
                    },
                },
            }];
        },
    },
]);
