PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'enable-fts-search-method',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        title: 'guide.step_plugin.create-ttyg-agent.fts-search.title',
                        content: 'guide.step_plugin.create-ttyg-agent.fts-search.content',
                        url: '/ttyg',
                        class: 'info-fts-search-guide-dialog',
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create-ttyg-agent.fts-search.enable-toggle',
                        class: 'toggle-fts-search-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-fts_search'),
                        clickableElementSelector: GuideUtils.getGuideElementSelector('query-method-fts_search-input'),
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(GuideUtils.getGuideElementSelector('query-method-fts_search-input')))
                    }, options)
                }
            ];
        }
    }
]);
