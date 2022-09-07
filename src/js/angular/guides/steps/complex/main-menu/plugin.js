PluginRegistry.add('guide.step', [
    {
        'guideBlockName': 'click-main-menu',
        'getSteps': (options, GuideUtils) => {
            const steps = [];

            const menuSelector = options.menuSelector;
            const submenuSelector = options.submenuSelector;

            const mainMenuClickElementPostSelector = !!submenuSelector ? ' div' : ' a';

            // Main menu element
            steps.push({
                'guideBlockName': 'clickable-element',
                'options': angular.extend({}, {
                    'title': 'guide.step_plugin.click-main-menu.' + options.label + '.main-menu.title',
                    'content': 'guide.step_plugin.click-main-menu.' + options.label + '.main-menu.content',
                    'elementSelector': GuideUtils.getGuideElementSelector(menuSelector),
                    showOn: () => {
                        // If submenu is visible this mean that we have to close menu.
                        if (!!submenuSelector && GuideUtils.isGuideElementVisible(submenuSelector)) {
                            GuideUtils.clickOnGuideElement(menuSelector, mainMenuClickElementPostSelector)();
                        }
                        return true;
                    },
                    onNextClick: (guide) => {
                        GuideUtils.clickOnGuideElement(menuSelector, mainMenuClickElementPostSelector)();

                        if (!submenuSelector) {
                            guide.next();
                        }
                    }
                }, options)
            })

            if (!!submenuSelector) {
                steps.push({
                    'guideBlockName': 'clickable-element',
                    'options': angular.extend({}, {
                        'title': 'guide.step_plugin.click-main-menu.' + options.label + '.menu.title',
                        'content': 'guide.step_plugin.click-main-menu.' + options.label + '.menu.content',
                        'elementSelector': GuideUtils.getGuideElementSelector(submenuSelector),
                        placement: 'right',
                        canBePaused: false,
                        showOn: () => {
                            // If submenu is visible this mean that we have to close menu.
                            if (!GuideUtils.isGuideElementVisible(submenuSelector)) {
                                GuideUtils.clickOnGuideElement(menuSelector, ' div')();
                            }
                            return true;
                        },
                        onNextClick: (guide) => {
                            GuideUtils.clickOnGuideElement(submenuSelector, ' a')();
                            guide.next();
                        }
                    }, options)
                })
            }
            return steps;
        }
    }
]);
