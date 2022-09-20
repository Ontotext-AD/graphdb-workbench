PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'click-main-menu',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const steps = [];

            let menuSelector;
            let menuTitle;
            let submenuSelector;
            let submenuTitle;
            let viewName;
            let helpInfo;

            switch (options.menu) {
                case "repositories":
                    menuSelector = 'menu-setup';
                    menuTitle = 'menu.setup.label';
                    submenuSelector = 'sub-menu-repositories';
                    submenuTitle = 'menu.repositories.label';
                    viewName = 'menu.repositories.label';
                    helpInfo = 'view.repositories.helpInfo';

                    break;
                case "import":
                    menuSelector = 'menu-import';
                    menuTitle = 'common.import';
                    viewName = 'common.import';
                    helpInfo = 'view.import.helpInfo';

                    break;
                case "autocomplete":
                    menuSelector = 'menu-setup';
                    menuTitle = 'menu.setup.label';
                    submenuSelector = 'sub-menu-autocomplete';
                    submenuTitle = 'menu.autocomplete.label';
                    viewName = 'view.autocomplete.title';
                    helpInfo = 'view.autocomplete.helpInfo';

                    break;
                case "visual-graph":
                    menuSelector = 'menu-explore';
                    menuTitle = 'menu.explore.label';
                    submenuSelector = 'sub-menu-visual-graph';
                    submenuTitle = 'visual.graph.label';
                    viewName = 'visual.graph.label';
                    helpInfo = 'view.visual.graph.helpInfo';

                    break;
                case "sparql":
                    menuSelector = 'menu-sparql';
                    menuTitle = 'menu.sparql.label';
                    viewName = 'view.sparql.title';
                    helpInfo = 'view.sparql.helpInfo';

                    break;
            }

            const mainMenuClickElementPostSelector = !!submenuSelector ? ' div' : ' a';
            options.viewName = viewName;

            // View intro element
            if (options.showIntro && options.mainAction) {
                steps.push({
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        content: 'guide.step-intro.' + options.mainAction,
                        extraContent: helpInfo,
                        extraContentClass: 'alert alert-help text-left'
                    }, options)
                });
            }

            // Main menu element
            steps.push({
                guideBlockName: 'clickable-element',
                options: angular.extend({}, {
                    content: 'guide.step-menu.click-menu',
                    menuLabelKey: menuTitle,
                    elementSelector: GuideUtils.getGuideElementSelector(menuSelector),
                    showOn: () => {
                        // If submenu is visible this mean that we have to close menu.
                        if (!!submenuSelector && GuideUtils.isGuideElementVisible(submenuSelector)) {
                            GuideUtils.clickOnGuideElement(menuSelector, mainMenuClickElementPostSelector)();
                        }
                        return true;
                    },
                    onNextClick: (guide) =>
                        GuideUtils.clickOnGuideElement(menuSelector, mainMenuClickElementPostSelector)()
                            .then(() => {
                                if (!submenuSelector) {
                                    guide.next();
                                }
                            })
                }, options)
            })

            if (!!submenuSelector) {
                steps.push({
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step-menu.click-menu',
                        menuLabelKey: submenuTitle,
                        elementSelector: GuideUtils.getGuideElementSelector(submenuSelector),
                        placement: 'right',
                        canBePaused: false,
                        showOn: () => {
                            // If submenu is visible this mean that we have to close menu.
                            if (!GuideUtils.isGuideElementVisible(submenuSelector)) {
                                GuideUtils.clickOnGuideElement(menuSelector, ' div')();
                            }
                            return true;
                        },
                        onNextClick: (guide) => GuideUtils.clickOnGuideElement(submenuSelector, ' a')().then(() => guide.next())
                    }, options)
                })
            }
            return steps;
        }
    }
]);
