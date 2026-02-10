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
            case 'repositories':
                menuSelector = 'menu-setup';
                menuTitle = 'menu.setup.label';
                menuDialogClass = 'menu-setup';
                submenuSelector = 'sub-menu-repositories';
                submenuTitle = 'menu.repositories.label';
                submenuDialogClass = 'sub-menu-repositories';
                viewName = 'menu.repositories.label';
                helpInfo = 'view.repositories.helpInfo';

                break;
            case 'import':
                menuSelector = 'menu-import';
                menuTitle = 'common.import';
                menuDialogClass = 'menu-import';
                viewName = 'common.import';
                helpInfo = 'view.import.helpInfo';

                break;
            case 'connectors':
                menuSelector = 'menu-setup';
                menuTitle = 'menu.setup.label';
                menuDialogClass = 'menu-setup-guide-dialog';
                submenuSelector = 'sub-menu-connectors';
                submenuTitle = 'menu.connectors.label';
                submenuDialogClass = 'sub-menu-connectors-guide-dialog';
                viewName = 'view.connector.management.title';
                helpInfo = 'view.connector.management.helpInfo';

                break;
            case 'autocomplete':
                menuSelector = 'menu-setup';
                menuTitle = 'menu.setup.label';
                menuDialogClass = 'menu-setup';
                submenuSelector = 'sub-menu-autocomplete';
                submenuTitle = 'menu.autocomplete.label';
                submenuDialogClass = 'sub-menu-autocomplete';
                viewName = 'view.autocomplete.title';
                helpInfo = 'view.autocomplete.helpInfo';

                break;
            case 'visual-graph':
                menuSelector = 'menu-explore';
                menuTitle = 'menu.explore.label';
                menuDialogClass = 'menu-explore';
                submenuSelector = 'sub-menu-visual-graph';
                submenuTitle = 'visual.graph.label';
                submenuDialogClass = 'sub-menu-visual-graph';
                viewName = 'visual.graph.label';
                helpInfo = 'view.visual.graph.helpInfo';

                break;
            case 'sparql':
                menuSelector = 'menu-sparql';
                menuTitle = 'menu.sparql.label';
                menuDialogClass = 'menu-sparql';
                viewName = 'view.sparql-editor.title';
                helpInfo = 'view.sparql-editor.helpInfo';

                break;
            case 'class-hierarchy':
                menuSelector = 'menu-explore';
                menuTitle = 'menu.explore.label';
                menuDialogClass = 'menu-explore';
                submenuSelector = 'menu-class-hierarchy';
                submenuTitle = 'menu.class.hierarchy.label';
                submenuDialogClass = 'sub-menu-class-hierarchy';
                viewName = 'view.class.hierarchy.title';
                helpInfo = 'view.class.hierarchy.helpInfo';

                break;
            case 'class-relationships':
                menuSelector = 'menu-explore';
                menuTitle = 'menu.explore.label';
                menuDialogClass = 'menu-explore';
                submenuSelector = 'sub-menu-class-relationships';
                submenuTitle = 'menu.class.relationships.label';
                submenuDialogClass = 'sub-menu-class-relationships';
                viewName = 'view.class.relationships.title';
                helpInfo = 'view.class.relationships.helpInfo';

                break;
            case 'ttyg':
                menuSelector = 'menu-lab';
                menuTitle = 'menu.lab.label';
                menuDialogClass = 'menu-lab';
                submenuSelector = 'sub-menu-ttyg';
                submenuTitle = 'menu.ttyg.label';
                submenuDialogClass = 'sub-menu-ttyg';
                viewName = 'menu.ttyg.label';
                helpInfo = 'ttyg.helpInfo';

                break;
            case 'similarity':
                menuSelector = 'menu-explore';
                menuTitle = 'menu.explore.label';
                menuDialogClass = 'menu-explore';
                submenuSelector = 'sub-menu-similarity';
                submenuTitle = 'menu.similarity.label';
                submenuDialogClass = 'sub-menu-similarity';
                viewName = 'menu.similarity.label';
                helpInfo = 'guide.step-help-info.create-similarity-index';
                break;
            case 'rdf-rank':
                menuSelector = 'menu-setup';
                menuTitle = 'menu.setup.label';
                menuDialogClass = 'menu-setup';
                submenuSelector = 'sub-menu-rdf-rank';
                submenuTitle = 'view.rdf.rank.title';
                submenuDialogClass = 'sub-menu-rdf-rank';
                viewName = 'view.rdf.rank.title';
                helpInfo = 'view.rdf.rank.helpInfo';
                break;
            }

            const mainMenuClickElementPostSelector = submenuSelector ? ' div' : ' a';
            options.viewName = viewName;

            // View intro element
            if (options.showIntro && options.mainAction) {
                steps.push({
                    guideBlockName: 'info-message',
                    options: {
                        content: 'guide.step-intro.' + options.mainAction,
                        extraContent: helpInfo,
                        extraContentClass: 'alert alert-help text-left',
                        skipPoint: true,
                        skipButtonLabel: GuideUtils.BUTTONS.SKIP_SECTION,
                        ...options,
                    },
                });
            }

            const elementSelector = GuideUtils.getGuideElementSelector(menuSelector);
            // Main menu element
            steps.push({
                guideBlockName: 'clickable-element',
                options: {
                    content: 'guide.step-menu.click-menu',
                    menuLabelKey: menuTitle,
                    class: menuDialogClass,
                    elementSelector,
                    beforeShowPromise: () => {
                        if (!!submenuSelector && GuideUtils.isGuideElementVisible(submenuSelector)) {
                            return new Promise((resolve) => {
                                GuideUtils.clickOnGuideElement(menuSelector, mainMenuClickElementPostSelector)();
                                // Needed to wait the layout to complete, before painting, thus avoiding ResizeObserver loop error
                                setTimeout(resolve, 500);
                            });
                        }
                        return Promise.resolve();
                    },

                    onNextClick: GuideUtils.clickOnGuideElement(menuSelector, mainMenuClickElementPostSelector),
                    scrollToHandler: () => GuideUtils.scrollIntoView(elementSelector, {block: 'center'}),
                    initPreviousStep: (services, stepId) => {
                        const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                        if (previousStep) {
                            return previousStep.options.initPreviousStep(services, previousStep.options.id);
                        }

                        return Promise.resolve();
                    },
                    ...options,
                },
            });

            if (submenuSelector) {
                const elementSubmenuSelector = GuideUtils.getGuideElementSelector(submenuSelector);
                steps.push({
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step-menu.click-menu',
                        menuLabelKey: submenuTitle,
                        class: submenuDialogClass,
                        elementSelector: elementSubmenuSelector,
                        placement: 'right',
                        canBePaused: false,
                        onNextClick: GuideUtils.clickOnGuideElement(submenuSelector, ' a'),
                        scrollToHandler: () => GuideUtils.scrollIntoView(elementSubmenuSelector, {block: 'center'}),
                        initPreviousStep: (services, stepId) => {
                            const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                            if (previousStep) {
                                return previousStep.options.initPreviousStep(services, previousStep.options.id);
                            }

                            return Promise.resolve();
                        },
                        ...options,
                        // We might want to click menu + submenu, without intro message. If we configure a skipPoint
                        // then it will be added to both steps
                        skipPoint: false,
                    },
                });
            }
            return steps;
        },
    },
]);
