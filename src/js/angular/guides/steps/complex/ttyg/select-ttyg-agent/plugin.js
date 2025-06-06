PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'select-ttyg-agent',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'select-ttyg-agent';

            return [
                {
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.select-ttyg-agent.info.content',
                        url: '/ttyg',
                        class: 'select-ttyg-agent-guide-dialog',
                        skipPoint: true,
                        disablePreviousFlow: true,
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.select-ttyg-agent.open-agent-dropdown',
                        class: 'open-agent-dropdown-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('select-agent-dropdown'),
                        disableNextFlow: true
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.select-ttyg-agent.select-agent',
                        elementSelector: GuideUtils.getGuideElementSelector('select-agent-panel'),
                        class: 'select-your-agent-guide-dialog',
                        show: () => () => {
                            const elementToObserve = document.querySelector(GuideUtils.getGuideElementSelector('select-agent-dropdown'));
                            const dropdownToggleElement = document.querySelector(GuideUtils.getGuideElementSelector('select-agent-dropdown-toggle'));

                            options.observer = new MutationObserver(attributesChangeCallback);
                            options.observer.observe(elementToObserve, {attributes: true});

                            function attributesChangeCallback(mutationList) {
                                for (const mutation of mutationList) {
                                    if (mutation.type === 'attributes') {
                                        const isOpened = mutation.target.classList.contains('open');

                                        // The component we use for selecting the agent automatically closes
                                        // after the user clicks on the view, which is why we have to open it.
                                        if (!(isOpened)) {
                                            dropdownToggleElement.click();
                                        }
                                    }
                                }
                            }
                        },
                        disablePreviousFlow: true,
                        disableNextFlow: true,
                        hide: () => () => {
                            options.observer.disconnect();
                        }
                    }, options)
                },
                {
                    // If missing repository modal is visible go to next step, otherwise skip it
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        beforeShowPromise: (guide, currentStep) => {
                            return GuideUtils.getOrWaitFor(GuideUtils.getElementSelector('.confirm-dialog .cancel-btn'), 1)
                                .then(() => {
                                    // Using a timeout because the library executes logic to show the step in a then clause which causes current and next steps to show
                                    setTimeout(() => guide.next())
                                })
                                .catch(() => {
                                    const stepId = currentStep.id;
                                    // Using a timeout because the library executes logic to show the step in a then clause which causes current and next steps to show
                                    setTimeout(() => guide.show(stepId + 2))
                                })
                        },
                        disablePreviousFlow: true
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.select-ttyg-agent.missing-repository',
                        elementSelector: GuideUtils.getElementSelector('.confirm-dialog .cancel-btn'),
                        showOn: () => GuideUtils.isVisible('.confirm-dialog .cancel-btn'),
                        onNextClick: () => {
                            // Close the modal by clicking on cancel button
                            GuideUtils.clickOnElement('.confirm-dialog .cancel-btn')();
                        },
                        show: (guide, currentStep) => () => {
                            const currentStepId = currentStep.id;
                            // Add "click" listener to the element. Upon clicking the element the guide is set back 3 steps to open dropdown step
                            $(currentStep.elementSelector).on('click', () => {
                                guide.show(currentStepId - 3)
                            });
                        },
                        hide: (guide, currentStep) => () => {
                            // Remove the "click" listener of element. It is important when step is hidden.
                            $(currentStep.elementSelector).off('click');
                        }
                    }, options)
                },
            ];
        }
    }
]);
