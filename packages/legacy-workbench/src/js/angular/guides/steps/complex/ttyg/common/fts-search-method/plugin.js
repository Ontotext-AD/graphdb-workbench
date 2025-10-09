const FTS_METHOD_DEFAULT_TITLE = "guide.step-action.fts-search-method";

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'set-max-triples-per-call',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            return {
                guideBlockName: 'input-element',
                options: {
                    content: 'guide.step_plugin.fts-search-method.set-max-triples-per-call',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: FTS_METHOD_DEFAULT_TITLE}),
                    class: 'toggle-fts-search',
                    ...options,
                    url: 'ttyg',
                    elementSelector: GuideUtils.getGuideElementSelector('max-triples-per-call-input'),
                    onNextValidate: () => {
                        if (options.maxTriplesPerCall) {
                            return Promise.resolve(GuideUtils.validateTextInput(GuideUtils.getGuideElementSelector('max-triples-per-call-input'), options.maxTriplesPerCall, false));
                        }
                        return Promise.resolve(true);
                    },
                },
            };
        },
    },
    {
        guideBlockName: "ttyg-fts-method-disable",
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const toggleSelector = GuideUtils.getGuideElementSelector('query-method-fts_search-input');

            return [
                {
                    guideBlockName: 'toggle-element',
                    options: {
                        content: 'guide.step_plugin.fts-search-method.disable-toggle',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: FTS_METHOD_DEFAULT_TITLE}),
                        class: 'toggle-fts-search',
                        ...options,
                        disable: true,
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-fts_search'),
                        toggleableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(!GuideUtils.isChecked(toggleSelector)),
                    },
                },
            ];
        },
    },
    {
        guideBlockName: "ttyg-fts-method-info",
        getSteps: (options, services) => {
            return [
                {
                    guideBlockName: 'info-message',
                    options: {
                        content: 'guide.step_plugin.fts-search-method.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: FTS_METHOD_DEFAULT_TITLE}),
                        class: 'info-fts-search',
                        ...options,
                        url: 'ttyg',
                    },
                },
            ];
        },
    },
    {
        guideBlockName: "ttyg-fts-method-enable",
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const toggleSelector = GuideUtils.getGuideElementSelector('query-method-fts_search-input');

            return [
                {
                    guideBlockName: 'toggle-element',
                    options: {
                        content: 'guide.step_plugin.fts-search-method.enable-toggle',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: FTS_METHOD_DEFAULT_TITLE}),
                        class: 'toggle-fts-search',
                        ...options,
                        url: 'ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('query-method-fts_search'),
                        toggleableElementSelector: toggleSelector,
                        onNextValidate: () => Promise.resolve(GuideUtils.isChecked(toggleSelector)),
                    },
                },
            ];
        },
    },
    {
        guideBlockName: 'fts-search-method',
        getSteps: (options, services) => {
            options.mainAction = 'fts-search-method';
            const shouldToggleOff = options.disable;

            if (shouldToggleOff) {
                return [{
                    guideBlockName: 'ttyg-fts-method-disable', options: {...options},
                }];
            }

            const steps = [
                {
                    guideBlockName: 'ttyg-fts-method-info', options: {...options},
                },
                {
                    guideBlockName: 'ttyg-fts-method-enable', options: {...options},
                },
            ];

            if (options.maxTriplesPerCall) {
                steps.push({
                    guideBlockName: 'set-max-triples-per-call',
                    options: {...options},
                });
            }

            return steps;
        },
    },
]);
