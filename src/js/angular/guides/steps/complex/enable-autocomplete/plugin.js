PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'enable-autocomplete',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const toastr = services.toastr;
            const $translate = services.$translate;
            const $interpolate = services.$interpolate;
            options.mainAction = 'enable-autocomplete';

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
                    elementSelector: GuideUtils.getGuideElementSelector('autocompleteCheckbox'),
                    onNextValidate: (step) => {

                        if (!GuideUtils.isVisible()) {
                            GuideUtils.noNextErrorToast(toastr, $translate, $interpolate,
                                'guide.step_plugin.enable-autocomplete.error', options);
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
            ]
        }
    }
]);
