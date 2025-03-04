PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'conversation-with-ttyg-agent',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'conversation-with-ttyg-agent';
            const startNewConversation = options.startNewConversation;

            const steps = [
                {
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        skipPoint: true,
                        url: '/ttyg',
                        class: 'conversation-info-guide-dialog',
                        content: 'guide.step_plugin.conversation-with-ttyg-agent.info',
                    }, options)
                }
            ];

            if (startNewConversation) {
                steps.push({
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.conversation-with-ttyg-agent.start-conversation',
                        class: 'start-conversation-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('create-chat-btn'),
                        onNextClick: () => {
                        }
                    }, options)
                });
            }

            const questionSteps = options.questions.map((questionWithOptions) => {
                return {
                    guideBlockName: 'ask-ttyg-agent',
                    options: questionWithOptions
                };
            });

            steps.push(...questionSteps);

            return steps;
        }
    }
]);
