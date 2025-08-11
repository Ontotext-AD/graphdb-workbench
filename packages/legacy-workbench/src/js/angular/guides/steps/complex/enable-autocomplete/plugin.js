const ENABLE_AUTOCOMPLETE_DEFAULT_TITLE = "guide.step-action.enable-autocomplete";

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'autocomplete-enable-checkbox',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const autocompleteCheckboxSelector = GuideUtils.getGuideElementSelector('autocompleteCheckbox');
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.enable-autocomplete.content',
                        class: 'enable-autocomplete-checkbox',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: ENABLE_AUTOCOMPLETE_DEFAULT_TITLE}),
                        ...options,
                        url: 'autocomplete',
                        elementSelector: autocompleteCheckboxSelector,
                        // Disable default behavior of service when element is clicked.
                        advanceOn: undefined,
                        beforeShowPromise: () => GuideUtils.deferredShow(500)(),
                        show: (guide) => () => {
                            // Added listener to the element.
                            $(autocompleteCheckboxSelector)
                                .on('mouseup.autocompleteCheckboxClick', function () {

                                    // If autocomplete is enabled go to the next step.
                                    GuideUtils.deferredShow(200)()
                                        .then(() => {
                                            if (GuideUtils.isGuideElementChecked('autocompleteCheckbox', ' input')) {
                                                guide.next();
                                            }
                                        });
                                });
                        },
                        onNextClick: (guide) => {
                            if (!GuideUtils.isGuideElementChecked('autocompleteCheckbox', ' input')) {
                                $(autocompleteCheckboxSelector).trigger('click');
                            }
                            guide.next();
                        },
                        hide: () => () => {
                            // Remove ths listener from element. It is important when step is hided.
                            $(autocompleteCheckboxSelector).off('mouseup.autocompleteCheckboxClick');
                        }
                    }
                }

            ]
        }
    },
    {
        guideBlockName: 'autocomplete-focus-on-indexing-status',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            return {
                guideBlockName: 'read-only-element',
                options: {
                    content: 'guide.step_plugin.enable-autocomplete.status_info.content',
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: ENABLE_AUTOCOMPLETE_DEFAULT_TITLE}),
                    ...options,
                    url: 'autocomplete',
                    elementSelector: GuideUtils.getGuideElementSelector('autocompleteStatus'),
                    class: 'autocomplete-status-info',
                    canBePaused: false
                }
            }
        }
    },
    {
        guideBlockName: 'enable-autocomplete',
        getSteps: (options, services) => {
            options.mainAction = 'enable-autocomplete';

            return [
                {
                    guideBlockName: 'click-main-menu',
                    options: angular.extend({}, {
                        menu: 'autocomplete',
                        showIntro: true
                    }, options)
                }, {
                    guideBlockName: 'autocomplete-enable-checkbox', options: {...options}
                },
                {
                    guideBlockName: 'autocomplete-focus-on-indexing-status', options: {...options}
                }
            ];
        }
    }
]);
