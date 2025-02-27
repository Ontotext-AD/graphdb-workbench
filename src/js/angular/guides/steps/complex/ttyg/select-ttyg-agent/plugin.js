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
                        skipPoint: true
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.select-ttyg-agent.open-agent-dropdown',
                        class: 'open-agent-dropdown-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('select-agent-dropdown')
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
                        onNextClick: () => {
                            // Do not allow the user to go to the next step because we want the user to click the button themselves.
                        },
                        onNextValidate: () => Promise.resolve(GuideUtils.isGuideElementVisible('selected-agent')),
                        hide: () => () => {
                            options.observer.disconnect();
                        }
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.select-ttyg-agent.missing-repository',
                        elementSelector: GuideUtils.getElementSelector('.confirm-dialog .cancel-btn'),
                        onNextClick: () => {
                            // Close the modal by canceling
                            GuideUtils.clickOnElement('.confirm-dialog .cancel-btn');
                        },
                        hide: (guide, currentStepDescription) => () => {
                            // Revert 2 steps to select agent open
                            const currentStepId = currentStepDescription.id;
                            setTimeout(() => guide.show(currentStepId - 2));
                        }
                    }, options)
                },
            ];
        }
    }
]);
