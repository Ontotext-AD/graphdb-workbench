PluginRegistry.add('guide.step', [
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
                        class: 'toggle-fts-search-guide-dialog',
                        url: '/ttyg',
                        showOn: () => GuideUtils.isChecked(toggleSelector),
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-fts_search'),
                        clickableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(!GuideUtils.isChecked(toggleSelector))
                    }, options)
                }]
            }

            return [
                {
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.fts-search-method.content',
                        url: '/ttyg',
                        class: 'info-fts-search-guide-dialog',
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.fts-search-method.enable-toggle',
                        class: 'toggle-fts-search-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-fts_search'),
                        clickableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(toggleSelector))
                    }, options)
                }
            ];
        }
    }
]);
