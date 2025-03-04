PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'ask-ttyg-agent',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'ask-ttyg-agent';
            options.maxWaitTime = 10;
            options.forceReload = false;

            const explain = options.explain;
            const explainMore = options.explainMore;
            const exploreSparql = options.exploreSparql;

            const steps = [
                {
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        skipPoint: true,
                        content: `guide.step_plugin.ask-ttyg-agent.input-question`,
                        class: 'input-question-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('question-input'),
                        show: (guide) => () => {
                            const elementSelector = GuideUtils.getGuideElementSelector('question-input');

                            // Add "keydown" listener to the element. The question-input directive listens for keypress of enter to trigger question asking.
                            // When enter is pressed, proceed with next step. Using 'keydown' to trigger before the directive 'keypress', which clears the value.
                            $(elementSelector).on('keydown', (event) => {
                                const value = $(elementSelector).val();

                                if (value && event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
                                    guide.next();
                                }
                            });
                        },
                        hide: () => () => {
                            const elementSelector = GuideUtils.getGuideElementSelector('question-input');
                            // Remove the "keydown" listener of element. It is important when step is hidden.
                            $(elementSelector).off('keydown');
                        },
                        onNextClick: () => {
                            // Do not allow the user to go to the next step because we want the user to click the button themselves.
                        }
                    }, options)
                },
                getWaitForAnswerStep(GuideUtils, options)
            ];

            if (explain) {
                const explainBtnSelector = GuideUtils.getLastGuideElementSelector('explain-response-btn');
                const elementSelector = GuideUtils.getLastGuideElementSelector('chat-item', explainBtnSelector);

                steps.push(
                    {
                        // If button is not visible for some reason, skip the whole step
                        guideBlockName: 'info-message',
                        options: angular.extend({}, {
                            url: '/ttyg',
                            skipPoint: true,
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
                        options: angular.extend({}, {
                            skipPoint: true,
                            content: 'guide.step_plugin.ask-ttyg-agent.explain-answer',
                            class: 'explain-answer-guide-dialog',
                            url: '/ttyg',
                            elementSelector,
                            onNextClick: () => {
                            }
                        }, options)
                    },
                    getWaitForAnswerStep(GuideUtils, options)
                )
            }

            if (explain && exploreSparql) {
                const exploreSparqlBtnSelector = GuideUtils.getLastGuideElementSelector('open-in-sparql-editor-btn');
                const elementSelector = GuideUtils.getLastGuideElementSelector('chat-item', exploreSparqlBtnSelector);

                steps.push(
                    {
                        // If button is not visible for some reason, skip the whole step
                        guideBlockName: 'info-message',
                        options: angular.extend({}, {
                            url: '/ttyg',
                            skipPoint: true,
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
                        options: angular.extend({}, {
                            content: 'guide.step_plugin.ask-ttyg-agent.explore-sparql',
                            class: 'explore-sparql-guide-dialog',
                            url: '/ttyg',
                            skipPoint: true,
                            elementSelector,
                            onNextClick: () => {
                                // Do not allow the user to go to the next step because we want the user to click the button themselves.
                            }
                        }, options)
                    }
                )
            }

            if (explain && explainMore) {
                const explainMoreBtnSelector = GuideUtils.getLastGuideElementSelector('how-derive-answer-btn');
                const elementSelector = GuideUtils.getLastGuideElementSelector('chat-item', explainMoreBtnSelector);

                steps.push(
                    {
                        // If button is not visible for some reason, skip the whole step
                        guideBlockName: 'info-message',
                        options: angular.extend({}, {
                            url: '/ttyg',
                            skipPoint: true,
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
                            },
                        }, options)
                    },
                    {
                        guideBlockName: 'clickable-element',
                        options: angular.extend({}, {
                            content: 'guide.step_plugin.ask-ttyg-agent.explain-answer-more',
                            class: 'input-agent-name-guide-dialog',
                            url: '/ttyg',
                            skipPoint: true,
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
                            },
                            onNextClick: () => {
                                // Do not allow the user to go to the next step because we want the user to click the button themselves.
                            }
                        }, options)
                    },
                    getWaitForAnswerStep(GuideUtils, options)
                )
            }

            return steps;
        }
    }
]);

const getWaitForAnswerStep = (GuideUtils, options) => {
    return {
        guideBlockName: 'focus-element',
        options: angular.extend({}, {
            content: 'guide.step_plugin.ask-ttyg-agent.wait-for-answer',
            class: 'wait-for-answer-guide-dialog',
            url: '/ttyg',
            placement: 'left',
            elementSelector: GuideUtils.getGuideElementSelector('chat-details'),
            onNextValidate: () => Promise.resolve(!GuideUtils.isGuideElementVisible('question-loader'))
        }, options)
    }
}
