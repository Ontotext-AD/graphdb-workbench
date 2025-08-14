const CONVERSATION_WITH_AGENT_DEFAULT_TITLE = 'guide.step-action.conversation-with-ttyg-agent';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'ttyg-conversation-info-message',
        getSteps: (options, services) => {
            return [
                {
                    guideBlockName: 'info-message',
                    options: {
                        skipPoint: true,
                        class: 'conversation-info',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: CONVERSATION_WITH_AGENT_DEFAULT_TITLE }),
                        content: 'guide.step_plugin.conversation-with-ttyg-agent.info',
                        ...options,
                        url: 'ttyg',
                    }
                }
            ]
        }
    },
    {
      guideBlockName: 'ttyg-click-to-create-new-chat',
      getSteps: (options, services) => {
          const GuideUtils = services.GuideUtils;
          const createChatBtnSelector = GuideUtils.getGuideElementSelector('create-chat-btn')
          return [
              {
                  guideBlockName: 'clickable-element',
                  options: {
                      content: 'guide.step_plugin.conversation-with-ttyg-agent.start-conversation',
                      // If mainAction is set the title will be set automatically
                      ...(options.mainAction ? {} : { title: CONVERSATION_WITH_AGENT_DEFAULT_TITLE }),
                      class: 'start-conversation',
                      disableNextFlow: true,
                      ...options,
                      url: 'ttyg',
                      elementSelector: createChatBtnSelector,
                  }
              }
          ]
      }
    },
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
                    guideBlockName: 'ttyg-conversation-info-message',
                    options: {...options}
                })
            }

            if (startNewConversation) {
                const createChatBtnSelector = GuideUtils.getGuideElementSelector('create-chat-btn')
                const newConversationStartSteps = [
                    {
                        // If button is not visible for some reason, skip the whole step
                        guideBlockName: 'info-message',
                        options: angular.extend({}, {
                            url: 'ttyg',
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
                        guideBlockName: 'ttyg-click-to-create-new-chat', options: {...options}
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
