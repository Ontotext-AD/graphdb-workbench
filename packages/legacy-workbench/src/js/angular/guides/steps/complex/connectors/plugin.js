const CONNECTORS_DEFAULT_TITLE = 'menu.connectors.label';

const getConnectorNameSelector = (options, services) => {
    return services.GuideUtils.getGuideElementSelector(`connector-name-${options.connectorName}`);
}

const getConnectorContentSelector = (options, services) => {
    return services.GuideUtils.getGuideElementSelector(`${options.instanceName}-connector-content`);
}

const getConnectorParameterSelector = (options, services) => {
    return services.GuideUtils.getGuideElementSelector(`${options.parameterName}-connector-parameter`);
}

const getConnectorSubparameterSelector = (options, services) => {
    return services.GuideUtils.getGuideElementSelector(`${options.subparameterName}-connector-subproperty`)
}

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'connectors-connectors-intro',
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
         */
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [{
                guideBlockName: 'read-only-element',
                options: {
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: CONNECTORS_DEFAULT_TITLE}),
                    placement: 'top',
                    class: 'connectors-connectors-intro',
                    
                    ...options,
                    elementSelector: getConnectorNameSelector(options, services),
                    url: 'connectors'
                }
            }];
        }
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
                    ...options,
                    elementSelector: `${connectorNameSelector} ${connectorCardSelector}`,
                    url: 'connectors'
                }
            }];
        }
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
                    class: 'connectors-connector-intro',
                    ...options,
                    elementSelector: `${connectorNameSelector} ${connectorToggleButtonSelector}`,
                    url: 'connectors',
                    onNextClick: () => {
                        GuideUtils.clickOnElement(`${connectorNameSelector} ${connectorToggleButtonSelector}`)();
                    }
                }
            }];
        }
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
            const GuideUtils = services.GuideUtils;
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
                    ...options,
                    elementSelector: `${connectorNameSelector} ${connectorContentSelector} ${parameterSelector}`,
                    url: 'connectors'
                }
            }];
        }
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
            const GuideUtils = services.GuideUtils;
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
                    ...options,
                    elementSelector: `${connectorNameSelector} ${connectorContentSelector} ${parameterSelector} ${subparameterName}`,
                    url: 'connectors'
                }
            }];
        }
    }
]);
