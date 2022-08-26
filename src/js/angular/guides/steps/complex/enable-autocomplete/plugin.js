PluginRegistry.add('guide.step', [
    {
        'guideBlockName': 'enable-autocomplete',
        'getSteps': (options, GuideUtils) => [
            {
                'guideBlockName': 'click-main-menu',
                'options': angular.extend({}, {
                    'label': 'menu_setup_autocomplete',
                    'menuSelector': 'menu-setup',
                    'submenuSelector': 'sub-menu-autocomplete'
                }, options)
            }, {
                'guideBlockName': 'clickable-element',
                'options': angular.extend({}, {
                    'title': 'guide.step_plugin.enable-autocomplete.title',
                    'content': 'guide.step_plugin.enable-autocomplete.content',
                    'url': '/autocomplete',
                    'elementSelector': GuideUtils.getGuideElementSelector('autocompleteCheckbox'),
                    'onNextClick': (guide) => {
                        GuideUtils.waitFor(GuideUtils.getGuideElementSelector('autocompleteCheckbox', ' input'), 3, false)
                            .then(autocompleteCheckbox => {
                                if (!autocompleteCheckbox.is(':checked')) {
                                    GuideUtils.clickOnGuideElement('autocompleteCheckbox')();
                                }
                            });
                        guide.next();
                    }
                }, options)
            }
        ]
    }
]);
