PluginRegistry.add('guide.step', [
    {
        'guideBlockName': 'click-main-menu',
        'getSteps': (options, GuideUtils) => {
            const steps = [];
            const isSubmenu = options.hasOwnProperty('parentMenuSelector');
            if (isSubmenu) {
                steps.push({
                    'guideBlockName': 'clickable-element',
                    'options': angular.extend({}, {
                        'title': 'guide.step_plugin.click-main-menu.' + options.label + '.main-menu.title',
                        'content': 'guide.step_plugin.click-main-menu.' + options.label + '.main-menu.content',
                        'elementSelector': GuideUtils.getGuideElementSelector(options.parentMenuSelector),
                        // Open main menu if is not open
                        'onNextClick': () => {
                            // first we check if sub menu is not visible this mean that parent menu is not open.
                            if (!GuideUtils.isGuideElementVisible(options.menuSelector)) {
                                // If is not open then triggers click event on it.
                                GuideUtils.clickOnGuideElement(options.parentMenuSelector, ' div')();
                            }
                        },
                        // Close main menu if is open
                        'onPreviousClick': () => {
                            // first we check if sub menu is visible this mean that parent menu is open.
                            if (GuideUtils.isGuideElementVisible(options.menuSelector)) {
                                // If is open then triggers click event on it.
                                GuideUtils.clickOnGuideElement(options.parentMenuSelector, ' div')();
                            }
                        }
                    }, options)
                });
            }
            steps.push({
                'guideBlockName': 'clickable-element',
                'options': angular.extend({}, {
                    'title': 'guide.step_plugin.click-main-menu.' + options.label + '.menu.title',
                    'content': 'guide.step_plugin.click-main-menu.' + options.label + '.menu.content',
                    'elementSelector': GuideUtils.getGuideElementSelector(options.menuSelector),
                    'placement': 'left',
                    'onNextClick': () => {
                        GuideUtils.clickOnGuideElement(options.menuSelector, ' a')()
                    },
                    'onPreviousClick': () => {
                        // first we check if sub menu is not visible this mean that parent menu is not open.
                        if (!GuideUtils.isGuideElementVisible(options.menuSelector)) {
                            // If is not open then triggers click event on it.
                            GuideUtils.clickOnGuideElement(options.parentMenuSelector, ' div')();
                        }
                    },
                    'canBePaused': !isSubmenu
                }, options)
            });
            return steps;
        }
    }
]);
