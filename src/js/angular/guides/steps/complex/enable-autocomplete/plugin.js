PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'enable-autocomplete',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const toastr = services.toastr;
            const $translate = services.$translate;
            const $interpolate = services.$interpolate;
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
                        // Disable default behavior of service when element is clicked.
                        advanceOn: undefined,
                        show: (guide) => () => {
                            // Added listener to the element.
                            $(autocompleteCheckboxSelector)
                                .on('mouseup.autocompleteCheckboxClick', function () {
                                    // If autocomplete is enabled go to the next step.
                                    if (!GuideUtils.isGuideElementChecked('autocompleteCheckbox', ' input')) {
                                        guide.next();
                                    }
                                });
                        },
                        hide: () => () => {
                            // Remove ths listener from element. It is important when step is hided.
                            $(autocompleteCheckboxSelector).off('mouseup.autocompleteCheckboxClick');
                        },
                        onNextValidate: () => {
                            if (!GuideUtils.isGuideElementChecked('autocompleteCheckbox', ' input')) {
                                GuideUtils.noNextErrorToast(toastr, $translate, $interpolate, 'guide.step_plugin.enable-autocomplete.error', options);
                                return false;
                            }
                            return true;
                        }
                    }, options)
                },
                {
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.enable-autocomplete.status_info.content',
                        url: '/autocomplete',
                        elementSelector: GuideUtils.getGuideElementSelector('autocompleteStatus'),
                        canBePaused: false
                    }, options)
                }
            ];
        }
    }
]);
