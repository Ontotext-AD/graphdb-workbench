const SIMILARITY_SEARCH_METHOD_DEFAULT_TITLE = 'guide.step-action.similarity-search-method';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'ttyg-similarity-toggle-off',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const toggleSelector = GuideUtils.getGuideElementSelector('query-method-similarity_search-input');
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.similarity-search-method.disable-toggle',
                        class: 'toggle-similarity-search',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: SIMILARITY_SEARCH_METHOD_DEFAULT_TITLE }),
                        ...options,
                        url: 'ttyg',
                        showOn: () => GuideUtils.isChecked(toggleSelector),
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-similarity_search'),
                        clickableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(!GuideUtils.isChecked(toggleSelector))
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'ttyg-similarity-info-message',
        getSteps: (options, services) => {
            return [
                {
                    guideBlockName: 'info-message',
                    options: {
                        content: 'guide.step_plugin.similarity-search-method.content',
                        class: 'info-similarity-search',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: SIMILARITY_SEARCH_METHOD_DEFAULT_TITLE }),
                        ...options,
                        url: 'ttyg',
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'ttyg-similarity-toggle-on',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const toggleSelector = GuideUtils.getGuideElementSelector('query-method-similarity_search-input');

            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.similarity-search-method.enable-toggle',
                        class: 'toggle-similarity-search',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: SIMILARITY_SEARCH_METHOD_DEFAULT_TITLE }),
                        ...options,
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-similarity_search'),
                        clickableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(toggleSelector))
                    }
                }
            ]
        }
    },
    {
      guideBlockName: 'ttyg-similarity-select-index',
      getSteps: (options, services) => {
          const GuideUtils = services.GuideUtils;
          return [
              {
                  guideBlockName: 'focus-element',
                  options: {
                      content: 'guide.step_plugin.similarity-search-method.select-index',
                      class: 'select-similarity-index',
                      // If mainAction is set the title will be set automatically
                      ...(options.mainAction ? {} : { title: SIMILARITY_SEARCH_METHOD_DEFAULT_TITLE }),
                      ...options,
                      elementSelector: GuideUtils.getGuideElementSelector('similarity-index-select'),
                  }
              }
          ]
      }
    },
    {
        guideBlockName: 'similarity-search-method',
        getSteps: (options, services) => {
            options.mainAction = 'similarity-search-method';

            const shouldToggleOff = options.disable;

            if (shouldToggleOff) {
                return [{
                    guideBlockName: 'ttyg-similarity-toggle-off', options: {...options}
                }]
            }

            return [
                {
                    guideBlockName: 'ttyg-similarity-info-message', options: {...options}
                },
                {
                    guideBlockName: 'ttyg-similarity-toggle-on', options: {...options}
                },
                {
                    guideBlockName: 'ttyg-similarity-select-index', options: {...options}
                }
            ];
        }
    }
]);
