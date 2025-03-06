PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'configure-agent',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            const configureExtractionMethods = (services, options) => {
                const methods = options.methods || [];

                return methods.map((method) => {
                    return {
                        guideBlockName: method.guideBlockName,
                        options: method.options
                    };
                });
            };

            const shouldEditName = options.editName;
            const hasModelName = options.model;
            const hasUserInstructions = options.userInstuctions;
            const shouldConfigureExtractionMethods = !!options.methods?.length;

            const steps = [
                {
                    guideBlockName: 'wait-for-element-to-show',
                    options: angular.extend({}, {
                        elementSelectorToShow: GuideUtils.getElementSelector('.agent-settings-modal'),
                        timeToWait: 10
                    }, options)
                }
            ]

            if (shouldEditName) {
                steps.push({
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.configure-agent.name-input',
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
                })
            }

            if (shouldConfigureExtractionMethods) {
                steps.push(...configureExtractionMethods(services, options))
            }

            if (hasModelName) {
                steps.push({
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.configure-agent.model-input',
                        class: 'input-model-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('model'),
                        onNextValidate: () => Promise.resolve(GuideUtils.validateTextInput(GuideUtils.getGuideElementSelector('model'), options.model, false))
                    }, options)
                })
            }

            if (hasUserInstructions) {
                steps.push({
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.configure-agent.user-instructions-input',
                        class: 'input-user-instructions-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('user-instructions'),
                        onNextValidate: () => Promise.resolve(GuideUtils.validateTextInput(GuideUtils.getGuideElementSelector('user-instructions'), options.userInstructions, false))
                    }, options)
                })
            }

            return steps;
        }
    }
]);
