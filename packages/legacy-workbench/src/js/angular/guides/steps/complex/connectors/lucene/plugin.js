const LUCINE_DEFAULT_TITLE = 'guide.step_plugin.connectors-lucine-connector-intro.title';
const LUCENE_CONNECTOR_KEY = 'Lucene';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'connectors-lucine-connector-intro',
        getSteps: (options) => {
            return [{
                guideBlockName: 'connectors-connector-intro',
                options: {
                    content: 'guide.step_plugin.connectors-lucine-connector-intro.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCINE_DEFAULT_TITLE}),
                    ...options,
                    connectorKey: LUCENE_CONNECTOR_KEY
                }
            }];
        }
    }, {
        guideBlockName: 'connectors-lucine-connector',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [{
                guideBlockName: 'read-only-element',
                options: {
                    content: 'guide.step_plugin.connectors-lucine-connector.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCINE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-open-lucine-connector',
                    url: 'connectors',
                    elementSelector: GuideUtils.getGuideElementSelector(`${options.connectorName}-connector-card`),
                }
            }];
        }
    }, {
        guideBlockName: 'connectors-open-lucine-connector',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            let connectorToggleButtonSelector = GuideUtils.getGuideElementSelector(`${options.connectorName}-connector-toggle-button`, ' a');
            return [{
                guideBlockName: 'clickable-element',
                options: {
                    content: 'guide.step_plugin.connectors-open-lucine-connector.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: LUCINE_DEFAULT_TITLE}),
                    ...options,
                    class: 'connectors-open-lucine-connector',
                    url: 'connectors',
                    elementSelector: connectorToggleButtonSelector,
                    onNextClick: GuideUtils.clickOnElement(connectorToggleButtonSelector)
                }
            }];
        }
    }
]);
