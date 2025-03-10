PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'conversation-with-ttyg-agent',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'conversation-with-ttyg-agent';
            const startNewConversation = options.startNewConversation;
            const showInfo = options.showInfo;

            const steps = [];

            if (showInfo) {
                steps.push({
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        skipPoint: true,
                        url: '/ttyg',
                        class: 'conversation-info-guide-dialog',
                        content: 'guide.step_plugin.conversation-with-ttyg-agent.info',
                    }, options)
                })
            }

            if (startNewConversation) {
                const createChatBtnSelector = GuideUtils.getGuideElementSelector('create-chat-btn')
                const newConversationStartSteps = [
                    {
                        // If button is not visible for some reason, skip the whole step
                        guideBlockName: 'info-message',
                        options: angular.extend({}, {
                            url: '/ttyg',
                            beforeShowPromise: (guide, currentStep) => GuideUtils.waitFor(createChatBtnSelector, 1)
                                .then(() => {
                                    // Using a timeout because the library executes logic to show the step in a then clause which causes current and next steps to show
                                    setTimeout(() => guide.next())
                                })
                                .catch(() => {
                                    const stepId = currentStep.id;
                                    // Using a timeout because the library executes logic to show the step in a then clause which causes current and next steps to show
                                    setTimeout(() => guide.show(stepId + 2))
                                }),
                        }, options)
                    },
                    {
                        guideBlockName: 'clickable-element',
                        options: angular.extend({}, {
                            content: 'guide.step_plugin.conversation-with-ttyg-agent.start-conversation',
                            class: 'start-conversation-guide-dialog',
                            url: '/ttyg',
                            elementSelector: createChatBtnSelector,
                            disableNextFlow: true
                        }, options)
                    }
                ]
                steps.push(...newConversationStartSteps);
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
