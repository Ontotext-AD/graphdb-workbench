PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'create-ttyg-agent',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'create-ttyg-agent';

            return [
                {
                    guideBlockName: 'click-main-menu',
                    options: angular.extend({}, {
                        menu: 'ttyg',
                        showIntro: true
                    }, options)
                },
                {
                    guideBlockName: 'guide-end',
                    options: angular.extend({}, {
                        title: 'guide.step_plugin.create-ttyg-agent.missing-key.title',
                        content: 'guide.step_plugin.create-ttyg-agent.missing-key.content',
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
                        content: 'guide.step_plugin.create-ttyg-agent.intro',
                        skipPoint: true
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create-ttyg-agent.create-agent',
                        class: 'create-agent-btn-guide-dialog',
                        url: '/ttyg',
                        maxWaitTime: 10,
                        elementSelector: GuideUtils.getGuideElementSelector('create-agent-btn'),
                        onNextClick: () => {
                            // Do not allow the user to go to the next step because we want the user to click the button themselves.
                        }
                    }, options)
                },
                {
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create-ttyg-agent.name-input',
                        class: 'input-agent-name-guide-dialog',
                        url: '/ttyg',
                        beforeShowPromise: () => GuideUtils.waitFor(GuideUtils.getGuideElementSelector('agent-form'), 5)
                            .catch((error) => {
                                services.toastr.error(services.$translate.instant('guide.unexpected.error.message'));
                                throw error;
                            }),
                        elementSelector: GuideUtils.getGuideElementSelector('agent-name'),
                        onNextValidate: () => Promise.resolve(GuideUtils.validateTextInputNotEmpty(GuideUtils.getGuideElementSelector('agent-name')))
                    }, options)
                },
                ...configureExtractionMethods(services, options),
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create-ttyg-agent.save-agent-settings',
                        class: 'save-agent-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('save-agent-settings'),
                        onNextClick: () => {
                            // Do not allow the user to go to the next step because we want the user to click the button themselves.
                        }
                    }, options)
                }
            ];
        }
    }
]);

const configureExtractionMethods = (services, options) => {
    const methods = options.methods || [];

    return methods.map((method) => {
      return {
        guideBlockName: method.guideBlockName,
        options: method.options
      };
    });
};
