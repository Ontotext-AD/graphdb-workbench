const CLASS_RELATIONSHIPS_DEFAULT_TITLE = 'view.class.relationships.title';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'class-relationships-intro',
        getSteps: (options) => {
            return [
                {
                    guideBlockName: 'info-message',
                    options: {
                        content: 'guide.step_plugin.class-relationships-intro.content',
                        url: 'relationships',
                        class: 'clas-hierarchy-intro',
                        placement: 'left',
                        // If mainAction is set the title will be set automatically
                        title: options.mainAction ?? CLASS_RELATIONSHIPS_DEFAULT_TITLE,
                        ...options
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'class-relationships-diagram-intro',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'read-only-element',
                    options: {
                        url: 'relationships',
                        elementSelector: GuideUtils.getGuideElementSelector('relationships-diagram'),
                        placement: 'left',
                        class: 'class-relationships-diagram-intro',
                        content: 'guide.step_plugin.class-relationships-diagram-intro.content',
                        // If mainAction is set the title will be set automatically
                        title: options.mainAction ?? CLASS_RELATIONSHIPS_DEFAULT_TITLE,
                        ...options
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'class-relationships-digram-thickness-intro',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'focus-element',
                    options: {
                        url: 'relationships',
                        elementSelector: GuideUtils.getGuideElementSelector('relationships-diagram'),
                        placement: 'left',
                        class: 'class-relationships-digram-thickness-intro',
                        content: 'guide.step_plugin.class-relationships-digram-thickness-intro.content',
                        // If mainAction is set the title will be set automatically
                        title: options.mainAction ?? CLASS_RELATIONSHIPS_DEFAULT_TITLE,
                        ...options
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'class-relationships-digram-predicates-intro',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'focus-element',
                    options: {
                        url: 'relationships',
                        elementSelector: GuideUtils.getGuideElementSelector('relationships-diagram'),
                        placement: 'left',
                        class: 'class-relationships-digram-predicates-intro',
                        content: 'guide.step_plugin.class-relationships-digram-predicates-intro.content',
                        // If mainAction is set the title will be set automatically
                        title: options.mainAction ?? CLASS_RELATIONSHIPS_DEFAULT_TITLE,
                        ...options
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'class-relationships-named-graph-selection',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'read-only-element',
                    options: {
                        url: 'relationships',
                        elementSelector: GuideUtils.getGuideElementSelector('graph-select-dropdown'),
                        placement: 'left',
                        class: 'class-relationships-named-graph-selection',
                        content: 'guide.step_plugin.class-relationships-named-graph-selection.content',
                        // If mainAction is set the title will be set automatically
                        title: options.mainAction ?? CLASS_RELATIONSHIPS_DEFAULT_TITLE,
                        ...options
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'class-relationships-class-list-intro',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'read-only-element',
                    options: {
                        url: 'relationships',
                        elementSelector: GuideUtils.getGuideElementSelector('class-list-wrapper'),
                        placement: 'right',
                        class: 'class-relationships-class-list-intro',
                        content: 'guide.step_plugin.class-relationships-class-list-intro.content',
                        // If mainAction is set the title will be set automatically
                        title: options.mainAction ?? CLASS_RELATIONSHIPS_DEFAULT_TITLE,
                        ...options
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'class-relationships-class-list-background-intro',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'read-only-element',
                    options: {
                        url: 'relationships',
                        elementSelector: GuideUtils.getGuideElementSelector('class-list'),
                        placement: 'right',
                        class: 'class-relationships-class-list-background-intro',
                        content: 'guide.step_plugin.class-relationships-class-list-background-intro.content',
                        // If mainAction is set the title will be set automatically
                        title: options.mainAction ?? CLASS_RELATIONSHIPS_DEFAULT_TITLE,
                        ...options
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'class-relationships-class-list-selection',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'focus-element',
                    options: {
                        url: 'relationships',
                        elementSelector: GuideUtils.getGuideElementSelector('class-list'),
                        placement: 'right',
                        class: 'class-relationships-class-list-selection',
                        content: 'guide.step_plugin.class-relationships-class-list-selection.content',
                        // If mainAction is set the title will be set automatically
                        title: options.mainAction ?? CLASS_RELATIONSHIPS_DEFAULT_TITLE,
                        ...options
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'class-relationships',
        getSteps: (options) => {
            options.mainAction = 'class-relationships';

            const steps = [
                {
                    guideBlockName: 'click-main-menu',
                    options: angular.extend({}, {
                        menu: 'class-relationships',
                        showIntro: true
                    }, options)
                }, {
                    guideBlockName: 'class-relationships-intro',
                    options: {...options}
                }
            ];

            if (options.introExtraContent) {
                steps.push({
                    guideBlockName: 'class-relationships-diagram-intro',
                    options: {
                        content: options.introExtraContent,
                        ...options
                    }
                });
            }

            return steps;
        }
    },
]);
