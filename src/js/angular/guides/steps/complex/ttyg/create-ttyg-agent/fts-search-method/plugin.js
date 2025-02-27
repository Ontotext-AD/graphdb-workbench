PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'enable-fts-search-method',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'enable-fts-search-method';

            return [
                {
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.enable-fts-search-method.content',
                        url: '/ttyg',
                        class: 'info-fts-search-guide-dialog',
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.enable-fts-search-method.enable-toggle',
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
