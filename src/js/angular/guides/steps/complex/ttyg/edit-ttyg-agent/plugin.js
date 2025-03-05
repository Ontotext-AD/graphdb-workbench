PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'edit-ttyg-agent',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const $location = services.$location;
            options.mainAction = 'edit-ttyg-agent';

            const configureExtractionMethods = (services, options) => {
                const methods = options.methods || [];

                return methods.map((method) => {
                    return {
                        guideBlockName: method.guideBlockName,
                        options: method.options
                    };
                });
            };

            return [
                {
                    guideBlockName: 'click-main-menu',
                    options: angular.extend({}, {
                        menu: 'ttyg',
                        showOn: () => '/ttyg' !== $location.path()
                    }, options)
                },
                {
                    guideBlockName: 'guide-end',
                    options: angular.extend({}, {
                        skipPoint: true,
                        title: 'guide.step_plugin.ttyg.missing-key.title',
                        content: 'guide.step_plugin.ttyg.missing-key.content',
                        url: '/ttyg',
                        beforeShowPromise: (guide, currentStepDescription) => {
                            // Check if error toast is visible waiting for 2 seconds
                            return GuideUtils.waitFor('.toast-message', 2)
                                .then(() => {
                                    // Error toast is visible, show this step and complete on next click
                                    currentStepDescription.onNextClick = (guide) => {
                                        guide.complete();
                                    };
                                })
                                .catch(() => {
                                    // Error toast is not visible, skip this step and move to next one
                                    // Using a timeout because the library executes logic to show the step in a then clause which causes current and next steps to show
                                    setTimeout(() => {
                                        guide.next();
                                    });
                                });
                        }
                    }, options)
                },
                {
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.edit-ttyg-agent.intro',
                        skipPoint: true
                    }, options)
                },
                {
                    // Show next step (which is actually 5 core steps) if there is a selected agent
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        beforeShowPromise: (guide, currentStep) => {
                            if (GuideUtils.isGuideElementVisible('selected-agent')) {
                                setTimeout(() => {
                                    // Using a timeout because the library executes async logic
                                    guide.show(currentStep.id + 6);
                                })
                            } else {
                                setTimeout(() => {
                                    // Using a timeout because the library executes async logic
                                    guide.next()
                                });
                            }
                        }
                    }, options)
                },
                {
                    guideBlockName: 'select-ttyg-agent',
                    options: angular.extend({}, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.edit-ttyg-agent.create-agent',
                        class: 'create-agent-btn-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('edit-current-agent'),
                        onNextClick: () => {
                            // Do not allow the user to go to the next step because we want the user to click the button themselves.
                        }
                    }, options)
                },
                ...configureExtractionMethods(services, options),
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.edit-ttyg-agent.save-agent-settings',
                        class: 'save-agent-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('save-agent-settings'),
                        onNextClick: () => {
                            // Do not allow the user to go to the next step because we want the user to click the button themselves.
                        }
                    }, options)
                },
                {
                    guideBlockName: 'wait-for-element-to-hide',
                    options: angular.extend({}, {
                        elementSelectorToHide: GuideUtils.getElementSelector('.agent-settings-modal'),
                        timeToWait: 10
                    }, options)
                }
            ];
        }
    }
]);

