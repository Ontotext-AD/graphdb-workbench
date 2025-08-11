PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'set-max-triples-per-call',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            return {
                guideBlockName: 'input-element',
                options: angular.extend({}, {
                    elementSelector: GuideUtils.getGuideElementSelector('max-triples-per-call-input'),
                    content: 'guide.step_plugin.fts-search-method.set-max-triples-per-call',
                    class: 'toggle-fts-search',
                    url: 'ttyg',
                    onNextValidate: () => {
                        if (options.maxTriplesPerCall) {
                            return Promise.resolve(GuideUtils.validateTextInput(GuideUtils.getGuideElementSelector('max-triples-per-call-input'), options.maxTriplesPerCall, false));
                        }
                        return Promise.resolve(true);
                    }
                }, options)
            }
        }
    },
    {
        guideBlockName: 'fts-search-method',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'fts-search-method';

            const shouldToggleOff = options.disable;
            const toggleSelector = GuideUtils.getGuideElementSelector('query-method-fts_search-input');

            if (shouldToggleOff) {
                return [{
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.fts-search-method.disable-toggle',
                        class: 'toggle-fts-search',
                        url: 'ttyg',
                        showOn: () => GuideUtils.isChecked(toggleSelector),
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-fts_search'),
                        clickableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(!GuideUtils.isChecked(toggleSelector))
                    }, options)
                }]
            }

            const steps = [
                {
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.fts-search-method.content',
                        url: 'ttyg',
                        class: 'info-fts-search'
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.fts-search-method.enable-toggle',
                        class: 'toggle-fts-search',
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-fts_search'),
                        clickableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(toggleSelector))
                    }, options)
                }
            ];

            if (options.maxTriplesPerCall) {
                steps.push({
                    guideBlockName: 'set-max-triples-per-call',
                    options: angular.extend({}, options)
                })
            }

            return steps
        }
    }
]);
