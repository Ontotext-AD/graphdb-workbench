PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'welcome',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const $translate = services.$translate;
            const $interpolate = services.$interpolate;

            return [
                {
                    guideBlockName: 'info-message',
                    options: {
                        title: 'guide.step_plugin.welcome.title',
                        content: 'guide.step_plugin.welcome.content',
                        infoIconHint: GuideUtils.translateLocalMessage($translate, $interpolate, 'guide.step_plugin.welcome.info-icon-hint', options),
                        mouseIconHint: GuideUtils.translateLocalMessage($translate, $interpolate, 'guide.step_plugin.welcome.mouse-icon-hint', options),
                        inputIconHint: GuideUtils.translateLocalMessage($translate, $interpolate, 'guide.step_plugin.welcome.input-icon-hint', options)
                    }
                },
                {
                    guideBlockName: 'info-message',
                    options: {
                        title: 'guide.step_plugin.welcome.title',
                        content: 'guide.step_plugin.welcome-what.content'
                    }
                }
            ];
        }
    }
]);

