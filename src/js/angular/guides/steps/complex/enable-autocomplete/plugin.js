PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'enable-autocomplete',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'enable-autocomplete';

            const autocompleteCheckboxSelector = GuideUtils.getGuideElementSelector('autocompleteCheckbox');
            return [
                {
                    guideBlockName: 'click-main-menu',
                    options: angular.extend({}, {
                        menu: 'autocomplete',
                        showIntro: true
                    }, options)
                }, {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.enable-autocomplete.content',
                        url: '/autocomplete',
                        elementSelector: autocompleteCheckboxSelector,
                        class: 'enable-autocomplete-checkbox-guide-dialog',
                        // Disable default behavior of service when element is clicked.
                        advanceOn: undefined,
                        show: (guide) => () => {
                            // Added listener to the element.
                            $(autocompleteCheckboxSelector)
                                .on('mouseup.autocompleteCheckboxClick', function () {
                                    // If autocomplete is enabled go to the next step.
                                    GuideUtils.deferredShow(20)()
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
                    }, options)
                },
                {
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.enable-autocomplete.status_info.content',
                        url: '/autocomplete',
                        elementSelector: GuideUtils.getGuideElementSelector('autocompleteStatus'),
                        class: 'autocomplete-status-info-guide-dialog',
                        canBePaused: false
                    }, options)
                }
            ];
        }
    }
]);
