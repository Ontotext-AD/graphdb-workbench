PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'table-graph-explore',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const RoutingUtil = services.RoutingUtil;
            options.mainAction = 'table-graph';

            const steps = [
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step-intro.table-graph',
                        scrollToHandler: GuideUtils.scrollToTop,
                        elementSelector: GuideUtils.getSparqlResultsSelectorForIri(options.iri),
                        class: 'table-graph-instance',
                        placement: 'top',
                        onNextClick: (guide, step) => {
                            GuideUtils.waitFor(step.elementSelector, 3)
                                .then(() => $(step.elementSelector).trigger('click'))
                                .then(() => guide.next());
                        },
                        initPreviousStep: (services, stepId) => {
                            const currentStepId = services.ShepherdService.getCurrentStepId();
                            if (currentStepId === stepId) {
                                return Promise.resolve();
                            }
                            const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                            return previousStep.options.initPreviousStep(services, previousStep.options.id);
                        }
                    }, options)
                }, {
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.table-graph-overview',
                        scrollToHandler: GuideUtils.scrollToTop,
                        elementSelector: GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_ROWS_SELECTOR,
                        class: 'table-graph-overview',
                        placement: 'top',
                        beforeShowPromise: () => GuideUtils.waitFor(`.resource-info a.source-link[href="${options.iri}"]`, 3)
                            .then(() => GuideUtils.waitFor(GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_ROWS_SELECTOR, 3)),
                        initPreviousStep: (services, stepId) => {
                            const currentStepId = services.ShepherdService.getCurrentStepId();
                            if (currentStepId === stepId) {
                                return GuideUtils.defaultInitPreviousStep(services, stepId);
                            }
                            const url = `resource?uri=${options.iri}&role=subject`;
                            if (url !== decodeURIComponent(RoutingUtil.getCurrentRoute())) {
                                RoutingUtil.navigate(`resource?uri=${options.iri}&role=subject`);
                                return GuideUtils.waitFor(`.resource-info a.source-link[href="${options.iri}"]`, 3);
                            }
                            return Promise.resolve();
                        }
                    }, options)
                }
            ];

            if (angular.isArray(options.subSteps)) {
                options.subSteps.forEach((subStep) => {

                    switch (subStep.type) {
                        case 'link':
                            steps.push({
                                guideBlockName: 'clickable-element',
                                options: angular.extend({}, {
                                    content: 'guide.step_plugin.table-graph-link',
                                    elementSelector: GuideUtils.getSparqlResultsSelectorForIri(subStep.iri),
                                    class: 'table-graph-link',
                                    onNextClick: (guide, step) => {
                                        GuideUtils.waitFor(step.elementSelector, 3)
                                            .then(() => $(step.elementSelector).trigger('click'))
                                            .then(() => guide.next());
                                    },
                                    initPreviousStep: (services, stepId) => {
                                        const linkUrl = `/resource?uri=${subStep.iri}&role=subject`;
                                        const tableGraphLinkUrl = `/resource?uri=${options.iri}&role=subject`;
                                        const url = decodeURIComponent(RoutingUtil.getCurrentRoute());

                                        const currentStepId = services.ShepherdService.getCurrentStepId();
                                        if (currentStepId === stepId && tableGraphLinkUrl === url) {
                                            // this case is first link in the sequence before click the link, so we have to resolve it.
                                            return Promise.resolve();
                                        }

                                        if (linkUrl === url) {
                                            // this case is first link in the sequence after click the link, so we have to call previous step.
                                            return GuideUtils.defaultInitPreviousStep(services, stepId);
                                        }

                                        RoutingUtil.navigate(linkUrl);
                                        return GuideUtils.waitFor(GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_ROWS_SELECTOR);
                                    }
                                }, angular.extend({}, options, subStep))
                            });
                            break;
                        case 'role':
                            steps.push({
                                guideBlockName: 'clickable-element',
                                options: angular.extend({}, {
                                    content: 'guide.step_plugin.table-graph-role',
                                    elementSelector: GuideUtils.getGuideElementSelector('role-' + subStep.role),
                                    class: 'visual_graph-role',
                                    onNextClick: (guide, step) => {
                                        GuideUtils.waitFor(step.elementSelector, 3)
                                            .then(() => $(step.elementSelector).trigger('click'))
                                            .then(() => guide.next());
                                    },
                                    initPreviousStep: (services, stepId) => {
                                        const currentStepId = services.ShepherdService.getCurrentStepId();
                                        if (currentStepId === stepId) {
                                            return Promise.resolve();
                                        }

                                        const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                                        return previousStep.options.initPreviousStep(services, previousStep.options.id)
                                            .then(() => {
                                                let url = RoutingUtil.getCurrentRoute();
                                                url = url.substring(0, url.indexOf('role=') + 5);
                                                url += subStep.role;
                                                RoutingUtil.navigate(url);
                                                return GuideUtils.waitFor(GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_ROWS_SELECTOR);
                                            });
                                    }
                                }, angular.extend({}, options, subStep))
                            });
                            break;
                        case 'visual':
                            steps.push({
                                guideBlockName: 'clickable-element',
                                options: angular.extend({}, {
                                    content: 'guide.step_plugin.table-graph-visual',
                                    elementSelector: GuideUtils.getGuideElementSelector('explore-visual'),
                                    class: 'table-graph-visual-button',
                                    onNextClick: (guide, step) => {
                                        GuideUtils.waitFor(step.elementSelector, 3)
                                            .then(() => $(step.elementSelector).trigger('click'));
                                    },
                                    initPreviousStep: (services, stepId) => {
                                        const currentStepId = services.ShepherdService.getCurrentStepId();
                                        if (currentStepId === stepId) {
                                            return Promise.resolve();
                                        }

                                        return GuideUtils.defaultInitPreviousStep(services, stepId);
                                    }
                                }, angular.extend({}, options, subStep))
                            });
                            steps.push({
                                guideBlockName: 'read-only-element',
                                options: angular.extend({}, {
                                    content: 'guide.step_plugin.visual_graph_intro.content',
                                    extraContent: subStep.extraContentVisualIntro,
                                    url: 'graphs-visualizations',
                                    elementSelector: '.graph-visualization',
                                    placement: 'left',
                                    canBePaused: false,
                                    forceReload: true,
                                    onNextClick: (guide) => {
                                        window.history.back();
                                        guide.next();
                                    }
                                }, angular.extend({}, options, subStep))
                            });
                            break;
                        case 'row':
                            steps.push({
                                guideBlockName: 'read-only-element',
                                options: angular.extend({}, {
                                    elementSelector: GuideUtils.getSparqlResultsSelectorForRow(subStep.row),
                                    class: 'visual_graph-row'
                                }, angular.extend({}, options, subStep))
                            });
                            break;
                        case 'table':
                            steps.push({
                                guideBlockName: 'read-only-element',
                                options: angular.extend({}, {
                                    elementSelector: GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_ROWS_SELECTOR,
                                    class: 'visual_graph-table',
                                    placement: 'top'
                                }, angular.extend({}, options, subStep))
                            });
                            break;
                    }
                });
            }

            return steps;
        }
    }
]);
