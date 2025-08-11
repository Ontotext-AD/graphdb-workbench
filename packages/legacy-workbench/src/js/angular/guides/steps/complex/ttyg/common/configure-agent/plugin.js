const TTYG_DEFAULT_TITLE = 'menu.ttyg.label';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'configure-top-p',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            const elementSelector = GuideUtils.getGuideElementSelector('top-p-control');
            const inputSelector = GuideUtils.getGuideElementSelector('top-p-control-input');

            return {
                guideBlockName: 'focus-element',
                options: {
                    url: 'ttyg',
                    elementSelector,
                    placement: 'bottom',
                    class: 'configure-top-p-guide-dialog',
                    content: 'guide.step_plugin.configure-top-p.info',
                    onNextValidate: () => Promise.resolve(GuideUtils.validateTextInput(inputSelector, options.topP)),
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: TTYG_DEFAULT_TITLE}),
                    ...options
                }
            };
        }
    },
    {
        guideBlockName: 'configure-temperature',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            const elementSelector = GuideUtils.getGuideElementSelector('temperature-control');
            const inputSelector = GuideUtils.getGuideElementSelector('temperature-control-input');

            return {
                guideBlockName: 'focus-element',
                options: {
                    url: 'ttyg',
                    elementSelector,
                    placement: 'bottom',
                    class: 'configure-temperature-guide-dialog',
                    content: 'guide.step_plugin.configure-temperature.info',
                    onNextValidate: () => Promise.resolve(GuideUtils.validateTextInput(inputSelector, options.temperature)),
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: TTYG_DEFAULT_TITLE}),
                    ...options
                }
            };
        }
    },
    {
        guideBlockName: 'configure-agent',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            const configureExtractionMethods = (services, options) => {
                const methods = options.methods || [];

                return methods.map((method) => {
                    return {
                        guideBlockName: method.guideBlockName,
                        options: {
                            disablePreviousFlow: false,
                            ...method.options
                        }
                    };
                });
            };

            const shouldEditName = options.editName;
            const hasModelName = options.model;
            const hasUserInstructions = options.userInstructions;
            const shouldConfigureExtractionMethods = !!options.methods?.length;
            const shouldConfigureTopP = options.topP !== undefined;
            const shouldConfigureTemperature = options.temperature !== undefined;

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
                        class: 'input-agent-name',
                        url: 'ttyg',
                        disablePreviousFlow: false,
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

            if (shouldConfigureTemperature) {
                steps.push({
                    guideBlockName: 'configure-temperature',
                    options: {...options}
                })
            }

            if (shouldConfigureTopP) {
                steps.push({
                    guideBlockName: 'configure-top-p',
                    options: {...options}
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
                        class: 'input-model',
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('model'),
                        disablePreviousFlow: false,
                        onNextValidate: () => Promise.resolve(GuideUtils.validateTextInput(GuideUtils.getGuideElementSelector('model'), options.model, false))
                    }, options)
                })
            }

            if (hasUserInstructions) {
                steps.push({
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.configure-agent.user-instructions-input',
                        class: 'input-user-instructions',
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('user-instructions'),
                        disablePreviousFlow: false,
                        onNextValidate: () => Promise.resolve(GuideUtils.validateTextInput(GuideUtils.getGuideElementSelector('user-instructions'), options.userInstructions, false))
                    }, options)
                })
            }
            // Removes the "Previous" button from the first method control step, because there is no previous step in the form.
            steps[1].options.disablePreviousFlow = true;
            return steps;
        }
    }
]);
