PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'create-similarity-index',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'create-similarity-index';

            return [
                {
                    guideBlockName: 'click-main-menu',
                    options: angular.extend({}, {
                        menu: 'similarity',
                        showIntro: true
                    }, options)
                }, {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create-similarity-index.create-similarity-index',
                        class: 'similarity-index-guide-dialog',
                        url: '/similarity',
                        elementSelector: GuideUtils.getGuideElementSelector('create-similarity-index'),
                        onNextClick: () => {}
                    }, options)
                },{
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create-similarity-index.input-index-name',
                        class: 'similarity-index-name-input-guide-dialog',
                        url: '/similarity/index/create',
                        elementSelector: GuideUtils.getGuideElementSelector('similarity-index-name'),
                        onNextValidate: () => Promise.resolve(GuideUtils.validateTextInputNotEmpty(GuideUtils.getGuideElementSelector('similarity-index-name')))
                    }, options)
                }, {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create-similarity-index.create-index',
                        class: 'create-similarity-index-guide-dialog',
                        url: '/similarity/index/create',
                        elementSelector: GuideUtils.getGuideElementSelector('create-similarity-index-btn'),
                        onNextClick: () => {}
                    }, options)
                },
            ];
        }
    }
]);
