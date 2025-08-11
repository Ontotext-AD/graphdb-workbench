const CONFIGURATION_OPTION_ONTOLOGY_GRAPH = 'ontologyGraph';
const CONFIGURATION_OPTION_SPARQL_QUERY = 'sparqlQuery';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'sparql-search-method-enable-ontology-graph',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            return [
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.sparql-search-method.enable-ontology-from-graph',
                        class: 'enable-ontology-from-graph',
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('sparql-ontology-graph-option'),
                        clickableElementSelector: GuideUtils.getGuideElementSelector('sparql-ontology-graph-option-input'),
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(GuideUtils.getGuideElementSelector('sparql-ontology-graph-option-input')))
                    }, options)
                },
                {
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        content: `guide.step_plugin.sparql-search-method.type-ontology-graph-name`,
                        class: 'input-ontology-graph-name',
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('sparql-ontology-graph-input'),
                        onNextValidate: () => Promise.resolve(GuideUtils.validateTextInput(GuideUtils.getGuideElementSelector('sparql-ontology-graph-input'), options.ontologyGraph, false))
                    }, options)
                }
            ]
        }
    },
    {
        guideBlockName: 'sparql-search-method-enable-sparql-query',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            return [
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.sparql-search-method.enable-sparql-query',
                        class: 'enable-sparql-query',
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('sparql-query-option'),
                        clickableElementSelector: GuideUtils.getGuideElementSelector('sparql-query-option-input'),
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(GuideUtils.getGuideElementSelector('sparql-query-option-input')))
                    }, options)
                },
                {
                    guideBlockName: 'copy-text-element',
                    options: angular.extend({}, {
                        elementSelector: GuideUtils.getGuideElementSelector('sparql-query-input'),
                        text: options.sparqlQuery,
                        onNextValidate: () => Promise.resolve(GuideUtils.validateTextInput(GuideUtils.getGuideElementSelector('sparql-query-input'), options.sparqlQuery, false))
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        elementSelector: GuideUtils.getGuideElementSelector('add-missing-namespaces-option'),
                        content: 'guide.step_plugin.sparql-search-method.add-missing-namespaces',
                        class: 'enable-sparql-query',
                        url: 'ttyg',
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(GuideUtils.getGuideElementSelector('add-missing-namespaces-input')))
                    }, options)
                }
            ]
        }
    },
    {
        guideBlockName: 'sparql-search-method',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'sparql-search-method';

            const shouldToggleOff = options.disable;
            const toggleSelector = GuideUtils.getGuideElementSelector('query-method-sparql_search-input');

            let configurationOption;
            if (options.ontologyGraph) {
                configurationOption = CONFIGURATION_OPTION_ONTOLOGY_GRAPH;
            } else if (options.sparqlQuery) {
                configurationOption = CONFIGURATION_OPTION_SPARQL_QUERY;
            }

            if (shouldToggleOff) {
                return [{
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.sparql-search-method.disable-toggle',
                        class: 'toggle-sparql-search',
                        url: 'ttyg',
                        showOn: () => GuideUtils.isChecked(toggleSelector),
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-sparql_search'),
                        clickableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(!GuideUtils.isChecked(toggleSelector))
                    }, options)
                }]
            }

            const steps = [
                {
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        content: `guide.step_plugin.sparql-search-method.content`,
                        class: 'info-sparql-search',
                        url: 'ttyg'
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.sparql-search-method.enable-toggle',
                        class: 'toggle-sparql-search',
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-sparql_search'),
                        clickableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(toggleSelector))
                    }, options)
                },
            ]

            if (configurationOption === CONFIGURATION_OPTION_ONTOLOGY_GRAPH) {
                steps.push({
                    guideBlockName: 'sparql-search-method-enable-ontology-graph',
                    options: angular.extend({}, options)
                });
            } else if (configurationOption === CONFIGURATION_OPTION_SPARQL_QUERY) {
                steps.push({
                    guideBlockName: 'sparql-search-method-enable-sparql-query',
                    options: angular.extend({}, options)
                });
            }

            return steps;
        }
    }
]);
