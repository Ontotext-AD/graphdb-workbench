const CONFIGURATION_OPTION_ONTOLOGY_GRAPH = 'ontologyGraph';
const CONFIGURATION_OPTION_SPARQL_QUERY = 'sparqlQuery';
const TTYG_SPARQL_SEARCH_METHOD_DEFAULT_TITLE = 'guide.step-action.sparql-search-method';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'ttyg-sparql-method-enable',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const toggleSelector = GuideUtils.getGuideElementSelector('query-method-sparql_search-input');
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.sparql-search-method.enable-toggle',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: TTYG_SPARQL_SEARCH_METHOD_DEFAULT_TITLE}),
                        class: 'toggle-sparql-search',
                        ...options,
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-sparql_search'),
                        clickableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(toggleSelector))
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'ttyg-sparql-method-disable',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const toggleSelector = GuideUtils.getGuideElementSelector('query-method-sparql_search-input');

            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.sparql-search-method.disable-toggle',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: TTYG_SPARQL_SEARCH_METHOD_DEFAULT_TITLE}),
                        class: 'toggle-sparql-search',
                        ...options,
                        url: 'ttyg',
                        showOn: () => GuideUtils.isChecked(toggleSelector),
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-sparql_search'),
                        clickableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(!GuideUtils.isChecked(toggleSelector))
                    }
                }
            ]
        }
    },
    {
        guideBlockName: "ttyg-sparql-method-ontology-select",
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.sparql-search-method.enable-ontology-from-graph',
                        class: 'enable-ontology-from-graph',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: TTYG_SPARQL_SEARCH_METHOD_DEFAULT_TITLE}),
                        ...options,
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('sparql-ontology-graph-option'),
                        clickableElementSelector: GuideUtils.getGuideElementSelector('sparql-ontology-graph-option-input'),
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(GuideUtils.getGuideElementSelector('sparql-ontology-graph-option-input')))
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'sparql-search-method-type-graph-name',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            return [
                {
                    guideBlockName: 'input-element',
                    options: {
                        content: `guide.step_plugin.sparql-search-method.type-ontology-graph-name`,
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: TTYG_SPARQL_SEARCH_METHOD_DEFAULT_TITLE}),
                        class: 'input-ontology-graph-name',
                        ...options,
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('sparql-ontology-graph-input'),
                        onNextValidate: () => Promise.resolve(GuideUtils.validateTextInput(GuideUtils.getGuideElementSelector('sparql-ontology-graph-input'), options.ontologyGraph, false))
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'ttyg-sparql-method-sparql-query-select',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            return [

            ]
        }
    },
    {
        guideBlockName: "ttyg-sparql-copy-query-text",
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            return [
                {
                    guideBlockName: 'copy-text-element',
                    options: {
                        elementSelector: GuideUtils.getGuideElementSelector('sparql-query-input'),
                        text: options.sparqlQuery,
                        ...options,
                        onNextValidate: () => Promise.resolve(GuideUtils.validateTextInput(GuideUtils.getGuideElementSelector('sparql-query-input'), options.sparqlQuery, false))
                    }
                }
            ]
        }
    },
    {
      guideBlockName: 'ttyg-sparql-click-add-namespaces',
      getSteps: (options, services) => {
          const GuideUtils = services.GuideUtils;

          return [
              {
                  guideBlockName: 'clickable-element',
                  options: {
                      content: 'guide.step_plugin.sparql-search-method.add-missing-namespaces',
                      // If mainAction is set the title will be set automatically
                      ...(options.mainAction ? {} : {title: TTYG_SPARQL_SEARCH_METHOD_DEFAULT_TITLE}),
                      class: 'enable-sparql-query',
                      ...options,
                      url: 'ttyg',
                      elementSelector: GuideUtils.getGuideElementSelector('add-missing-namespaces-option'),
                      onNextValidate: () => Promise.resolve(GuideUtils.isChecked(GuideUtils.getGuideElementSelector('add-missing-namespaces-input')))
                  }
              }
          ]
      }
    },
    {
      guideBlockName: 'ttyg-enabling-sparql-info-message',
      getSteps: (options, services) => {
          return [
              {
                  guideBlockName: 'info-message',
                  options: {
                      content: `guide.step_plugin.sparql-search-method.content`,
                      // If mainAction is set the title will be set automatically
                      ...(options.mainAction ? {} : {title: TTYG_SPARQL_SEARCH_METHOD_DEFAULT_TITLE}),
                      class: 'info-sparql-search',
                      ...options,
                      url: 'ttyg'
                  }
              }
          ]
      }
    },
    {
        guideBlockName: 'sparql-search-method-enable-ontology-graph',
        getSteps: (options, services) => {
            return [
                {
                    guideBlockName: 'ttyg-sparql-method-ontology-select', options: {...options}
                },
                {
                    guideBlockName: 'sparql-search-method-type-graph-name', options: {...options}
                }
            ]
        }
    },
    {
        guideBlockName: 'sparql-search-method-enable-sparql-query',
        getSteps: (options, services) => {
            return [
                {
                    guideBlockName: 'ttyg-sparql-method-sparql-query-select', options: {...options}
                },
                {
                    guideBlockName: 'ttyg-sparql-copy-query-text', options: {...options}
                },
                {
                    guideBlockName: 'ttyg-sparql-click-add-namespaces', options: {...options}
                }
            ]
        }
    },
    {
        guideBlockName: 'sparql-search-method',
        getSteps: (options, services) => {
            options.mainAction = 'sparql-search-method';

            const shouldToggleOff = options.disable;

            let configurationOption;
            if (options.ontologyGraph) {
                configurationOption = CONFIGURATION_OPTION_ONTOLOGY_GRAPH;
            } else if (options.sparqlQuery) {
                configurationOption = CONFIGURATION_OPTION_SPARQL_QUERY;
            }

            if (shouldToggleOff) {
                return [{
                    guideBlockName: 'ttyg-sparql-method-disable', options: {...options}
                }]
            }

            const steps = [
                {
                    guideBlockName: 'ttyg-enabling-sparql-info-message', options: {...options}
                },
                {
                    guideBlockName: 'ttyg-sparql-method-enable', options: {...options}
                },
            ]

            if (configurationOption === CONFIGURATION_OPTION_ONTOLOGY_GRAPH) {
                steps.push({
                    guideBlockName: 'sparql-search-method-enable-ontology-graph',
                    options: {...options}
                });
            } else if (configurationOption === CONFIGURATION_OPTION_SPARQL_QUERY) {
                steps.push({
                    guideBlockName: 'sparql-search-method-enable-sparql-query',
                    options: {...options}
                });
            }

            return steps;
        }
    }
]);
