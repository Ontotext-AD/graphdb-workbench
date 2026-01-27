const CREATE_SIMILARITY_INDEX_DEFAULT = 'guide.step-action.create-similarity-index';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'similarity-click-link',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.create-similarity-index.create-similarity-index',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: CREATE_SIMILARITY_INDEX_DEFAULT}),
                        class: 'similarity-index',
                        disableNextFlow: true,
                        ...options,
                        url: 'similarity',
                        elementSelector: GuideUtils.getGuideElementSelector('create-similarity-index'),
                        onNextClick: () => {
                        },
                    },
                },
            ];
        },
    },
    {
        guideBlockName: 'similarity-type-index-name',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'input-element',
                    options: {
                        content: 'guide.step_plugin.create-similarity-index.input-index-name',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: CREATE_SIMILARITY_INDEX_DEFAULT}),
                        class: 'similarity-index-name-input',
                        ...options,
                        url: 'similarity/index/create',
                        elementSelector: GuideUtils.getGuideElementSelector('similarity-index-name'),
                        onNextValidate: () => Promise.resolve(GuideUtils.validateTextInputNotEmpty(GuideUtils.getGuideElementSelector('similarity-index-name'))),
                    },
                },
            ];
        },
    },
    {
        guideBlockName: 'similarity-click-to-create',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.create-similarity-index.create-index',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: CREATE_SIMILARITY_INDEX_DEFAULT}),
                        class: 'create-similarity-index',
                        disablePreviousFlow: false,
                        disableNextFlow: true,
                        ...options,
                        url: 'similarity/index/create',
                        elementSelector: GuideUtils.getGuideElementSelector('create-similarity-index-btn'),
                    },
                },
            ];
        },
    },
    {
        guideBlockName: 'similarity-hold-and-wait-until-shown',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'hold-and-wait-until-shown',
                    options: {
                        content: 'guide.step_plugin.create-similarity-index.wait',
                        class: 'wait-for-index',
                        ...options,
                        elementSelectorToWait: GuideUtils.getGuideElementSelector('similarity-indexes-table'),
                    },
                },
            ];
        },
    },
    {
        guideBlockName: 'similarity-view-created-index',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const content = options.indexName ? 'guide.step_plugin.similarity-view-created-index' : 'guide.step_plugin.similarity-view-index';
            let selector;
            if (options.indexName) {
                selector = GuideUtils.getGuideElementSelector(`similarity-index-name-${options.indexName}`);
            } else {
                selector = GuideUtils.getGuideElementSelector(`similarity-index-row-${options.rowIndex ?? 0}`, 'td:has(> .index-name)');
            }

            return [
                {
                    guideBlockName: 'focus-element',
                    options: {
                        url: 'similarity',
                        content: options.content || content,
                        class: 'view-created-index',
                        ...(options.title ?? {title: CREATE_SIMILARITY_INDEX_DEFAULT}),
                        ...options,
                        elementSelector: selector,
                    },
                },
            ];
        },
    },
    {
        guideBlockName: 'create-similarity-index',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'create-similarity-index';

            return [
                {
                    guideBlockName: 'click-main-menu',
                    options: angular.extend({}, {
                        menu: 'similarity',
                        showIntro: true,
                    }, options),
                },
                {
                    guideBlockName: 'similarity-click-link', options: {...options},
                },
                {
                    guideBlockName: 'similarity-type-index-name', options: {...options},
                },
                {
                    guideBlockName: 'similarity-click-to-create', options: {...options},
                },
                {
                    // check if error block is shown and go back 2 steps or proceed
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        beforeShowPromise: (guide, currentStep) => GuideUtils.getOrWaitFor(GuideUtils.getGuideElementSelector('error'), 1)
                            .then(() => {
                                const stepId = currentStep.id;
                                // Using a timeout
                                // because the library executes logic
                                // to show the step in a then clause
                                // which causes current and next steps to show
                                setTimeout(() => guide.show(stepId - 2));
                            })
                            .catch(() => {
                                // Using a timeout
                                // because the library executes logic
                                // to show the step in a then clause
                                // which causes current and next steps to show
                                setTimeout(() => guide.next());
                            }),
                    }, options),
                },
                {
                    guideBlockName: 'similarity-hold-and-wait-until-shown', options: {...options},
                },
            ];
        },
    },
]);
