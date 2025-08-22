const TTYG_CREATE_AGENT_DEFAULT_TITLE = 'guide.step-action.create-ttyg-agent';

PluginRegistry.add('guide.step', [
    {
      guideBlockName: 'ttyg-create-agent-intro-message',
      getSteps: (options, services) => {
          return [
              {
                  guideBlockName: 'info-message',
                  options: {
                      content: 'guide.step_plugin.create-ttyg-agent.intro',
                      // If mainAction is set the title will be set automatically
                      ...(options.mainAction ? {} : { title: TTYG_CREATE_AGENT_DEFAULT_TITLE }),
                      ...options
                  }
              },
          ]
      }
    },
    {
        guideBlockName: 'ttyg-create-agent-click',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.create-ttyg-agent.create-agent',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: TTYG_CREATE_AGENT_DEFAULT_TITLE }),
                        class: 'create-agent-btn',
                        maxWaitTime: 10,
                        disableNextFlow: true,
                        ...options,
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('create-agent-btn'),
                    }
                }
            ]
        }
    },
    {
      guideBlockName: 'ttyg-create-agent-save',
      getSteps: (options, services) => {
          const GuideUtils = services.GuideUtils;

          return [
              {
                  guideBlockName: 'clickable-element',
                  options: {
                      content: 'guide.step_plugin.create-ttyg-agent.save-agent-settings',
                      // If mainAction is set the title will be set automatically
                      ...(options.mainAction ? {} : { title: TTYG_CREATE_AGENT_DEFAULT_TITLE }),
                      class: 'save-agent',
                      disablePreviousFlow: false,
                      disableNextFlow: true,
                      ...options,
                      url: 'ttyg',
                      elementSelector: GuideUtils.getGuideElementSelector('save-agent-settings')
                  }
              }
          ]
      }
    },
    {
        guideBlockName: 'create-ttyg-agent',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'create-ttyg-agent';

            return [
                {
                    guideBlockName: 'click-main-menu',
                    options: {
                        showIntro: true,
                        ...options,
                        menu: 'ttyg'
                    }
                },
                {
                    guideBlockName: 'end-on-api-key-error'
                },
                {
                    guideBlockName: 'ttyg-create-agent-intro-message',
                    options: {...options}
                },
                {
                    guideBlockName: 'ttyg-create-agent-click', options: {...options}
                },
                {
                    guideBlockName: 'configure-agent',
                    // Set name field as mandatory for creation
                    options: { ...options, editName: true }
                },
                {
                    guideBlockName: 'ttyg-create-agent-save', options: {...options}
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
