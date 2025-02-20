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
            let menuDialogClass = '';
            let submenuDialogClass = '';

            switch (options.menu) {
                case "repositories":
                    menuSelector = 'menu-setup';
                    menuTitle = 'menu.setup.label';
                    menuDialogClass = 'menu-setup-guide-dialog';
                    submenuSelector = 'sub-menu-repositories';
                    submenuTitle = 'menu.repositories.label';
                    submenuDialogClass = 'sub-menu-repositories-guide-dialog';
                    viewName = 'menu.repositories.label';
                    helpInfo = 'view.repositories.helpInfo';

                    break;
                case "import":
                    menuSelector = 'menu-import';
                    menuTitle = 'common.import';
                    menuDialogClass = 'menu-import-guide-dialog';
                    viewName = 'common.import';
                    helpInfo = 'view.import.helpInfo';

                    break;
                case "autocomplete":
                    menuSelector = 'menu-setup';
                    menuTitle = 'menu.setup.label';
                    menuDialogClass = 'menu-setup-guide-dialog';
                    submenuSelector = 'sub-menu-autocomplete';
                    submenuTitle = 'menu.autocomplete.label';
                    submenuDialogClass = 'sub-menu-autocomplete-guide-dialog';
                    viewName = 'view.autocomplete.title';
                    helpInfo = 'view.autocomplete.helpInfo';

                    break;
                case "visual-graph":
                    menuSelector = 'menu-explore';
                    menuTitle = 'menu.explore.label';
                    menuDialogClass = 'menu-explore-guide-dialog';
                    submenuSelector = 'sub-menu-visual-graph';
                    submenuTitle = 'visual.graph.label';
                    submenuDialogClass = 'sub-menu-visual-graph-guide-dialog';
                    viewName = 'visual.graph.label';
                    helpInfo = 'view.visual.graph.helpInfo';

                    break;
                case "sparql":
                    menuSelector = 'menu-sparql';
                    menuTitle = 'menu.sparql.label';
                    menuDialogClass = 'menu-sparql-guide-dialog';
                    viewName = 'view.sparql-editor.title';
                    helpInfo = 'view.sparql-editor.helpInfo';

                    break;
                case "class-hierarchy":
                    menuSelector = 'menu-explore';
                    menuTitle = 'menu.explore.label';
                    menuDialogClass = 'menu-explore-guide-dialog';
                    submenuSelector = 'menu-class-hierarchy';
                    submenuTitle = 'menu.class.hierarchy.label';
                    submenuDialogClass = 'sub-menu-class-hierarchy-guide-dialog';
                    viewName = 'view.class.hierarchy.title';
                    helpInfo = 'view.class.hierarchy.helpInfo';

                    break;
                case "ttyg":
                    menuSelector = 'menu-lab';
                    menuTitle = 'menu.lab.label';
                    menuDialogClass = 'menu-lab-guide-dialog';
                    submenuSelector = 'sub-menu-ttyg';
                    submenuTitle = 'menu.ttyg.label';
                    submenuDialogClass = 'sub-menu-ttyg-guide-dialog';
                    viewName = 'menu.ttyg.label';
                    helpInfo = 'ttyg.helpInfo';

                    break;
            }

            const mainMenuClickElementPostSelector = submenuSelector ? ' div' : ' a';
            options.viewName = viewName;

            // View intro element
            if (options.showIntro && options.mainAction) {
                steps.push({
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        content: 'guide.step-intro.' + options.mainAction,
                        extraContent: helpInfo,
                        extraContentClass: 'alert alert-help text-left',
                        skipPoint: true
                    }, options)
                });
            }

            // Main menu element
            steps.push({
                guideBlockName: 'clickable-element',
                options: angular.extend({}, {
                    content: 'guide.step-menu.click-menu',
                    menuLabelKey: menuTitle,
                    class: menuDialogClass,
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
                            }),
                    initPreviousStep: (services, stepId) => {
                        const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                        if (previousStep) {
                            return previousStep.options.initPreviousStep(services, previousStep.options.id);
                        }

                        return Promise.resolve();
                    }
                }, options)
            });

            if (submenuSelector) {
                steps.push({
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step-menu.click-menu',
                        menuLabelKey: submenuTitle,
                        class: submenuDialogClass,
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
                        onNextClick: (guide) => GuideUtils.clickOnGuideElement(submenuSelector, ' a')().then(() => guide.next()),
                        initPreviousStep: (services, stepId) => {
                            const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                            if (previousStep) {
                                return previousStep.options.initPreviousStep(services, previousStep.options.id);
                            }

                            return Promise.resolve();
                        }
                    }, options)
                });
            }
            return steps;
        }
    }
]);
