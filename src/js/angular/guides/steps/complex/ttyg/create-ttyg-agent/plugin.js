PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'create-ttyg-agent',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'create-ttyg-agent';

            return [
                {
                    guideBlockName: 'click-main-menu',
                    options: angular.extend({}, {
                        menu: 'ttyg',
                        showIntro: true
                    }, options)
                },
                {
                    guideBlockName: 'end-on-api-key-error'
                },
                {
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create-ttyg-agent.intro',
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create-ttyg-agent.create-agent',
                        class: 'create-agent-btn-guide-dialog',
                        url: '/ttyg',
                        maxWaitTime: 10,
                        elementSelector: GuideUtils.getGuideElementSelector('create-agent-btn'),
                        disableNextFlow: true
                    }, options)
                },
                {
                    guideBlockName: 'configure-agent',
                    // Set name field as mandatory for creation
                    options: angular.extend({}, options, {editName: true})
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create-ttyg-agent.save-agent-settings',
                        class: 'save-agent-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('save-agent-settings'),
                        disableNextFlow: true
                    }, options)
                },
                {
                    guideBlockName: 'wait-for-element-to-hide',
                    options: angular.extend({}, {
                        elementSelectorToHide: GuideUtils.getElementSelector('.agent-settings-modal'),
                        timeToWait: 10
                    }, options)
                }
            ];
        }
    }
]);
