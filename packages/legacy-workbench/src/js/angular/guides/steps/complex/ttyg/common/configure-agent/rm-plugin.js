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
                    class: 'configure-top-p',
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
                    class: 'configure-temperature',
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
        guideBlockName: 'configure-iri-discovery-search',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const toggleSelector = GuideUtils.getGuideElementSelector('iri-discovery-search-input');
            const shouldToggleOff = options.disable;

            let content;
            if (shouldToggleOff) {
                content = 'guide.step_plugin.iri-discovery-search.disable-toggle';
            } else {
                content = 'guide.step_plugin.iri-discovery-search.enable-toggle';
            }

            return {
                guideBlockName: 'clickable-element',
                options: {
                    content,
                    class: 'toggle-iri-discovery-search',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: TTYG_DEFAULT_TITLE}),
                    ...options,
                    url: 'ttyg',
                    elementSelector: GuideUtils.getGuideElementSelector('iri-discovery-search'),
                    clickableElementSelector: toggleSelector,
                    showOn: () => {
                        const isEnabled = GuideUtils.isChecked(toggleSelector);
                        return shouldToggleOff ? isEnabled : !isEnabled;
                    },
                    onNextValidate: () => {
                        const isEnabled = GuideUtils.isChecked(toggleSelector);
                        return Promise.resolve(shouldToggleOff ? !isEnabled : isEnabled);
                    }
                }
            }
        }
    },
    {
        guideBlockName: 'configure-agent-type-agent-name',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'input-element',
                    options: {
                        content: 'guide.step_plugin.configure-agent.name-input',
                        class: 'input-agent-name',
                        disablePreviousFlow: false,
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: TTYG_DEFAULT_TITLE}),
                        ...options,
                        url: 'ttyg',
                        beforeShowPromise: () => GuideUtils.waitFor(GuideUtils.getGuideElementSelector('agent-form'), 5)
                            .catch((error) => {
                                services.toastr.error(services.$translate.instant('guide.unexpected.error.message'));
                                throw error;
                            }),
                        elementSelector: GuideUtils.getGuideElementSelector('agent-name'),
                        onNextValidate: () => Promise.resolve(GuideUtils.validateTextInputNotEmpty(GuideUtils.getGuideElementSelector('agent-name')))
                    }
                }
            ]
        }
    },
    {
      guideBlockName: 'configure-agent-type-model-name',
      getSteps: (options, services) => {
          const GuideUtils = services.GuideUtils;
          return [
              {
                  guideBlockName: 'input-element',
                  options: {
                      content: 'guide.step_plugin.configure-agent.model-input',
                      // If mainAction is set the title will be set automatically
                      ...(options.mainAction ? {} : {title: TTYG_DEFAULT_TITLE}),
                      class: 'input-model',
                      disablePreviousFlow: false,
                      ...options,
                      url: 'ttyg',
                      elementSelector: GuideUtils.getGuideElementSelector('model'),
                      onNextValidate: () => Promise.resolve(GuideUtils.validateTextInput(GuideUtils.getGuideElementSelector('model'), options.model, false))
                  }
              }
          ]
      }
    },
    {
      guideBlockName: 'configure-agent-additional-instructions',
      getSteps: (options, services) => {
          const GuideUtils = services.GuideUtils;
          return [
              {
                  guideBlockName: 'copy-text-element',
                  options: {
                      extraContent: 'guide.step_plugin.configure-agent.user-instructions-input',
                      // If mainAction is set the title will be set automatically
                      ...(options.mainAction ? {} : {title: TTYG_DEFAULT_TITLE}),
                      class: 'input-user-instructions',
                      disablePreviousFlow: false,
                      text: options.userInstructions,
                      ...options,
                      url: 'ttyg',
                      elementSelector: GuideUtils.getGuideElementSelector('user-instructions'),
                      onNextValidate: () => Promise.resolve(GuideUtils.validateTextInput(GuideUtils.getGuideElementSelector('user-instructions'), options.userInstructions, false))
                  }
              }
          ]
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
            const shouldConfigureIriDiscoverySearch = !!options.iriDiscoverySearch;

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
                    guideBlockName: 'configure-agent-type-agent-name', options: {...options}
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

            if (hasModelName) {
                steps.push({
                    guideBlockName: 'configure-agent-type-model-name', options: {...options}
                })
            }

            if (shouldConfigureExtractionMethods) {
                steps.push(...configureExtractionMethods(services, options))
            }

            if (shouldConfigureIriDiscoverySearch) {
                steps.push({
                    guideBlockName: 'configure-iri-discovery-search',
                    options: {
                        disable: options.iriDiscoverySearch.disable,
                        ...options
                    }
                })
                /**/
            }

            if (hasUserInstructions) {
                steps.push({
                    guideBlockName: 'configure-agent-additional-instructions', options: {...options}
                })
            }
            // Removes the "Previous" button from the first method control step, because there is no previous step in the form.
            steps[1].options.disablePreviousFlow = true;
            return steps;
        }
    }
]);
