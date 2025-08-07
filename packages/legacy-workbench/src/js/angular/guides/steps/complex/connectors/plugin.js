const CONNECTORS_DEFAULT_TITLE = 'menu.connectors.label';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'connectors-connector-intro',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [{
                guideBlockName: 'read-only-element',
                options: {
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: CONNECTORS_DEFAULT_TITLE}),
                    placement: 'top',
                    class: 'connectors-connector-intro',
                    scrollToHandler: GuideUtils.scrollToTop,
                    ...options,
                    elementSelector: GuideUtils.getGuideElementSelector(`connector-key-${options.connectorKey}`),
                    url: 'connectors'
                }
            }];
        }
    }
]);
