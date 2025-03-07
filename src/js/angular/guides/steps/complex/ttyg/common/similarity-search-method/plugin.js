PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'similarity-search-method',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'similarity-search-method';

            const shouldToggleOff = options.disable;
            const toggleSelector = GuideUtils.getGuideElementSelector('query-method-similarity_search-input');

            if (shouldToggleOff) {
                return [{
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.similarity-search-method.disable-toggle',
                        class: 'toggle-similarity-search-guide-dialog',
                        url: '/ttyg',
                        showOn: () => GuideUtils.isChecked(toggleSelector),
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-similarity_search'),
                        clickableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(!GuideUtils.isChecked(toggleSelector))
                    }, options)
                }]
            }

            return [
                {
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.similarity-search-method.content',
                        url: '/ttyg',
                        class: 'info-similarity-search-guide-dialog',
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.similarity-search-method.enable-toggle',
                        class: 'toggle-similarity-search-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-similarity_search'),
                        clickableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(toggleSelector))
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.similarity-search-method.select-index',
                        elementSelector: GuideUtils.getGuideElementSelector('similarity-index-select'),
                        class: 'select-similarity-index-guide-dialog',
                    }, options)
                }
            ];
        }
    }
]);
