PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'enable-similarity_search-method',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        title: 'guide.step_plugin.create-ttyg-agent.similarity-search.title',
                        content: 'guide.step_plugin.create-ttyg-agent.similarity-search.content',
                        url: '/ttyg',
                        class: 'info-similarity-search-guide-dialog',
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create-ttyg-agent.similarity-search.enable-toggle',
                        class: 'toggle-similarity-search-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-similarity_search'),
                        clickableElementSelector: GuideUtils.getGuideElementSelector('query-method-similarity_search-input'),
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(GuideUtils.getGuideElementSelector('query-method-similarity_search-input')))
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create-ttyg-agent.similarity-search.select-index',
                        elementSelector: GuideUtils.getGuideElementSelector('similarity-index-select'),
                        class: 'select-similarity-index-guide-dialog',
                    }, options)
                }
            ];
        }
    }
]);
