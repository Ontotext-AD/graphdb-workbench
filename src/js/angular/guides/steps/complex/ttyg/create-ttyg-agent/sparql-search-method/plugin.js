PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'enable-sparql-search-method',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        title: 'guide.step_plugin.create-ttyg-agent.sparql-search.title',
                        content: `guide.step_plugin.create-ttyg-agent.sparql-search.content`,
                        class: 'info-sparql-search-guide-dialog',
                        url: '/ttyg'
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create-ttyg-agent.sparql-search.enable-toggle',
                        class: 'enable-toggle-sparql-search-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-sparql_search'),
                        clickableElementSelector: GuideUtils.getGuideElementSelector('query-method-sparql_search-input'),
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(GuideUtils.getGuideElementSelector('query-method-sparql_search-input')))
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create-ttyg-agent.sparql-search.enable-ontology-from-graph',
                        class: 'enable-ontology-from-graph-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('sparql-ontology-graph-option'),
                        clickableElementSelector: GuideUtils.getGuideElementSelector('sparql-ontology-graph-option-input'),
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(GuideUtils.getGuideElementSelector('sparql-ontology-graph-option-input')))
                    }, options)
                },
                {
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        content: `guide.step_plugin.create-ttyg-agent.sparql-search.type-ontology-graph-name`,
                        class: 'input-ontology-graph-name-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('sparql-ontology-graph-input'),
                        onNextValidate: () => Promise.resolve(GuideUtils.validateTextInput(GuideUtils.getGuideElementSelector('sparql-ontology-graph-input'), options.ontologyGraph, false))
                    }, options)
                }
            ];
        }
    }
]);
