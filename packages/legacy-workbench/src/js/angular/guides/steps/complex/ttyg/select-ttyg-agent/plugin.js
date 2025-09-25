const TTYG_SELECT_AGENT_DEFAULT_TITLE = 'guide.step-action.select-ttyg-agent';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'ttyg-select-agent-info-message',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'info-message',
                    options: {
                        content: 'guide.step_plugin.select-ttyg-agent.info.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: TTYG_SELECT_AGENT_DEFAULT_TITLE}),
                        class: 'select-ttyg-agent',
                        skipPoint: true,
                        skipButtonLabel: GuideUtils.BUTTONS.SKIP_SECTION,
                        disablePreviousFlow: true,
                        ...options,
                        url: 'ttyg',
                    },
                },
            ];
        },
    },
    {
        guideBlockName: 'ttyg-select-agent-dropdown-open',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.select-ttyg-agent.open-agent-dropdown',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: TTYG_SELECT_AGENT_DEFAULT_TITLE}),
                        class: 'open-agent-dropdown',
                        disableNextFlow: true,
                        ...options,
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('select-agent-dropdown'),
                    },
                },
            ];
        },
    },
    {
      guideBlockName: 'ttyg-select-agent-from-dropdown',
      getSteps: (options, services) => {
          const GuideUtils = services.GuideUtils;
          return [
              {
                  guideBlockName: 'clickable-element',
                  options: {
                      content: 'guide.step_plugin.select-ttyg-agent.select-agent',
                      // If mainAction is set the title will be set automatically
                      ...(options.mainAction ? {} : {title: TTYG_SELECT_AGENT_DEFAULT_TITLE}),
                      disableNextFlow: true,
                      class: 'select-your-agent',
                      ...options,
                      elementSelector: GuideUtils.getGuideElementSelector('select-agent-panel'),
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
                      hide: () => () => {
                          options.observer.disconnect();
                      },
                  },
              },
          ];
      },
    },
    {
      guideBlockName: 'ttyg-select-agent-check-for-missing-repository-cancel',
      getSteps: (options, services) => {
          const GuideUtils = services.GuideUtils;

          return [
              {
                  // If missing repository modal is visible go to next step, otherwise skip it
                  guideBlockName: 'info-message',
                  options: angular.extend({}, {
                      beforeShowPromise: (guide, currentStep) => {
                          return GuideUtils.getOrWaitFor(GuideUtils.getElementSelector('.confirm-dialog .cancel-btn'), 1)
                              .then(() => {
                                  // Using a timeout because the library executes logic to show the step in a then clause which causes current and next steps to show
                                  setTimeout(() => guide.next());
                              })
                              .catch(() => {
                                  const stepId = currentStep.id;
                                  // Using a timeout because the library executes logic to show the step in a then clause which causes current and next steps to show
                                  setTimeout(() => guide.show(stepId + 2));
                              });
                      },
                  }, options),
              },
              {
                  guideBlockName: 'clickable-element',
                  options: {
                      content: 'guide.step_plugin.select-ttyg-agent.missing-repository',
                      // If mainAction is set the title will be set automatically
                      ...(options.mainAction ? {} : {title: TTYG_SELECT_AGENT_DEFAULT_TITLE}),
                      ...options,
                      elementSelector: GuideUtils.getElementSelector('.confirm-dialog .cancel-btn'),
                      showOn: () => GuideUtils.isVisible('.confirm-dialog .cancel-btn'),
                      onNextClick: () => {
                          // Close the modal by clicking on the cancel button
                          GuideUtils.clickOnElement('.confirm-dialog .cancel-btn')();
                      },
                      show: (guide, currentStep) => () => {
                          const currentStepId = currentStep.id;
                          // Add a "click" listener to the element.
                          // Upon clicking the element, the guide is set back 3 steps to "open dropdown" step
                          $(currentStep.elementSelector).on('click', () => {
                              guide.show(currentStepId - 3);
                          });
                      },
                      hide: (guide, currentStep) => () => {
                          // Remove the "click" listener of the element. It is important when the step is hidden.
                          $(currentStep.elementSelector).off('click');
                      },
                  },
              },
          ];
      },
    },
    {
        guideBlockName: 'select-ttyg-agent',
        getSteps: (options) => {
            options.mainAction = 'select-ttyg-agent';

            return [
                {
                    guideBlockName: 'ttyg-select-agent-info-message',
                    options: {...options},
                },
                {
                    guideBlockName: 'ttyg-select-agent-dropdown-open',
                    options: {...options},
                },
                {
                    guideBlockName: 'ttyg-select-agent-from-dropdown',
                    options: {...options},
                },
                {
                    guideBlockName: 'ttyg-select-agent-check-for-missing-repository-cancel',
                    options: {...options},
                },
            ];
        },
    },
]);
