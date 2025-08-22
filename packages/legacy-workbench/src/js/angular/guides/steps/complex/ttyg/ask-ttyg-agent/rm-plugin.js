const TTYG_ASK_DEFAULT_TITLE = 'guide.step-action.ask-ttyg-agent';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'ttyg-ask-question',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'input-element',
                    options: {
                        content: `guide.step_plugin.ask-ttyg-agent.input-question`,
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: TTYG_ASK_DEFAULT_TITLE }),
                        class: 'input-question',
                        disableNextFlow: true,
                        ...options,
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('question-input'),
                        show: (guide) => () => {
                            const elementSelector = GuideUtils.getGuideElementSelector('contenteditable');

                            // Add "keydown" listener to the element.
                            // The question-input directive listens for "Enter" keypress to trigger question asking.
                            // When enter is pressed, proceed with next step.
                            // Using 'keydown' to trigger before the directive 'keypress', which clears the value.
                            $(elementSelector).on('keydown', (event) => {
                                const value = $(elementSelector).text();

                                if (value && event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
                                    guide.next();
                                }
                            });
                        },
                        hide: () => () => {
                            const elementSelector = GuideUtils.getGuideElementSelector('contenteditable');
                            // Remove the "keydown" listener of the element. It is important when the step is hidden.
                            $(elementSelector).off('keydown');
                        }
                    }
                },
                getWaitForAnswerStep(GuideUtils, options)
            ]
        }
    },
    {
        guideBlockName: 'ttyg-explain-response',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const explainBtnSelector = GuideUtils.getLastGuideElementSelector('explain-response-btn');
            const elementSelector = GuideUtils.getLastGuideElementSelector('chat-item', explainBtnSelector);
            return [
                {
                    // If button is not visible for some reason, skip the whole step
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        url: 'ttyg',
                        beforeShowPromise: (guide, currentStep) => GuideUtils.waitFor(elementSelector, 1)
                            .then(() => {
                                // Using a timeout because the library executes logic to show the step in a then clause which causes current and next steps to show
                                setTimeout(() => guide.next())
                            })
                            .catch(() => {
                                const stepId = currentStep.id;
                                // Using a timeout because the library executes logic to show the step in a then clause which causes current and next steps to show
                                setTimeout(() => guide.show(stepId + 3))
                            }),
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.ask-ttyg-agent.explain-answer',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: TTYG_ASK_DEFAULT_TITLE }),
                        class: 'explain-answer',
                        disableNextFlow: true,
                        ...options,
                        url: 'ttyg',
                        elementSelector,
                    }
                },
                getWaitForAnswerStep(GuideUtils, options)
            ]
        }
    },
    {
        guideBlockName: 'ttyg-ask-agent-explore-sparql',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const exploreSparqlBtnSelector = GuideUtils.getLastGuideElementSelector('open-in-sparql-editor-btn');
            const elementSelector = GuideUtils.getLastGuideElementSelector('chat-item', exploreSparqlBtnSelector);

            return [
                {
                    // If button is not visible for some reason, skip the whole step
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        url: 'ttyg',
                        beforeShowPromise: (guide, currentStep) => GuideUtils.waitFor(elementSelector, 1)
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
                    options: {
                        content: 'guide.step_plugin.ask-ttyg-agent.explore-sparql',
                        class: 'explore-sparql',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: TTYG_ASK_DEFAULT_TITLE }),
                        disableNextFlow: true,
                        ...options,
                        url: 'ttyg',
                        elementSelector
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'ttyg-ask-explain-answer-more',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const explainMoreBtnSelector = GuideUtils.getLastGuideElementSelector('how-derive-answer-btn');
            const elementSelector = GuideUtils.getLastGuideElementSelector('chat-item', explainMoreBtnSelector);
            return [
                {
                    // If button is not visible for some reason, skip the whole step
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        url: 'ttyg',
                        beforeShowPromise: (guide, currentStep) => {
                            return GuideUtils.waitFor(elementSelector, 1)
                                .then(() => {
                                    // Using a timeout because the library executes logic to show the step in a then clause which causes current and next steps to show
                                    setTimeout(() => guide.next())
                                })
                                .catch(() => {
                                    const stepId = currentStep.id;
                                    // Using a timeout because the library executes logic to show the step in a then clause which causes current and next steps to show
                                    setTimeout(() => guide.show(stepId + 3))
                                })
                        }
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.ask-ttyg-agent.explain-answer-more',
                        class: 'input-agent-name',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: TTYG_ASK_DEFAULT_TITLE }),
                        disableNextFlow: true,
                        ...options,
                        url: 'ttyg',
                        elementSelector,
                        show: (guide) => () => {
                            // Add "click" listener to the element. Upon clicking the element is hidden and this breaks the default flow of the guide.
                            // Adding a handler to proceed to next step
                            $(elementSelector).on('click', () => {
                                guide.next()
                            });
                        },
                        hide: () => () => {
                            // Remove the "click" listener of element. It is important when step is hidden.
                            $(elementSelector).off('click');
                        }
                    }
                },
                getWaitForAnswerStep(GuideUtils, options)
            ]
        }
    },
    {
        guideBlockName: 'ask-ttyg-agent',
        getSteps: (options) => {
            options.mainAction = 'ask-ttyg-agent';
            options.maxWaitTime = 10;
            options.forceReload = false;

            const explain = options.explain;
            const explainMore = options.explainMore;
            const exploreSparql = options.exploreSparql;

            const steps = [
                {
                    guideBlockName: 'ttyg-ask-question', options: {...options, skipPoint: true}
                }
            ];

            if (explain) {
                steps.push(
                    {
                        guideBlockName: 'ttyg-explain-response', options: {...options}
                    }
                )
            }

            if (explain && exploreSparql) {
                steps.push(
                    {
                        guideBlockName: 'ttyg-ask-agent-explore-sparql', options: {...options}
                    }
                )
            }

            if (explain && explainMore) {
                steps.push(
                    {
                        guideBlockName: 'ttyg-ask-explain-answer-more', options: {...options}
                    },
                )
            }

            return steps;
        }
    }
]);

const getWaitForAnswerStep = (GuideUtils, options) => {
    return {
        guideBlockName: 'hold-and-wait-until-hidden',
        options: angular.extend({}, {
            content: 'guide.step_plugin.ask-ttyg-agent.wait-for-answer',
            class: 'wait-for-answer',
            url: 'ttyg',
            placement: 'left',
            elementSelector: GuideUtils.getGuideElementSelector('chat-details'),
            elementSelectorToWait: GuideUtils.getGuideElementSelector('question-loader'),
        }, options)
    }
}
