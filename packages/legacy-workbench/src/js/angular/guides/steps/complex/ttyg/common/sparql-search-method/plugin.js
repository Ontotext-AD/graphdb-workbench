PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'sparql-search-method',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'sparql-search-method';

            const shouldToggleOff = options.disable;
            const toggleSelector = GuideUtils.getGuideElementSelector('query-method-sparql_search-input');

            if (shouldToggleOff) {
                return [{
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.sparql-search-method.disable-toggle',
                        class: 'toggle-sparql-search-guide-dialog',
                        url: '/ttyg',
                        showOn: () => GuideUtils.isChecked(toggleSelector),
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-sparql_search'),
                        clickableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(!GuideUtils.isChecked(toggleSelector))
                    }, options)
                }]
            }

            return [
                {
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        content: `guide.step_plugin.sparql-search-method.content`,
                        class: 'info-sparql-search-guide-dialog',
                        url: '/ttyg',
                        disablePreviousFlow: true
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.sparql-search-method.enable-toggle',
                        class: 'toggle-sparql-search-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-sparql_search'),
                        clickableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(toggleSelector))
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.sparql-search-method.enable-ontology-from-graph',
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
                        content: `guide.step_plugin.sparql-search-method.type-ontology-graph-name`,
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
