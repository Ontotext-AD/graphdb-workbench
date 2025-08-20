const RESOURCE_DEFAULT_TITLE = 'view.resource.title';

const getResourceURL = (options) => {
    let url = 'resource?role=';
    url += options.role ? options.role : 'subject';
    if (options.iri) {
        url += `&uri=${encodeURIComponent(options.iri)}`;
    }
    return url;
}

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'resource-results-explain',
        getSteps: (options) => {
            return [
                {
                    guideBlockName: 'sparql-results-explain',
                    options: {
                        content: 'guide.step_plugin.resource-results-explain.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: RESOURCE_DEFAULT_TITLE}),
                        ...options,
                        ...(options.skipUrl ? {} : {url: getResourceURL(options)}),
                        class: 'resource-results-explain'
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'resource-results-click-on-iri',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.resource-results-click-on-iri.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: RESOURCE_DEFAULT_TITLE}),
                        ...options,
                        elementSelector: GuideUtils.getSparqlResultsSelectorForIri(options.iri),
                        ...(options.skipUrl ? {} : {url: getResourceURL(options)}),
                        class: 'resource-results-click-on-iri',
                        onNextClick: (guide, step) => {
                            GuideUtils.waitFor(step.elementSelector, 3)
                                .then(() => $(step.elementSelector).trigger('click'))
                                .then(() => guide.next());
                        }
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'resource-results-row-explain',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'read-only-element',
                    options: {
                        content: 'guide.step_plugin.resource-results-row-explain.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: RESOURCE_DEFAULT_TITLE}),
                        ...options,
                        ...(options.skipUrl ? {} : {url: getResourceURL(options)}),
                        class: 'visual_graph-row',
                        elementSelector: GuideUtils.getSparqlResultsSelectorForRow(options.row)
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'resource-click-on-role',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: `guide.step_plugin.resource-click-on-role.${options.role}.content`,
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: RESOURCE_DEFAULT_TITLE}),
                        ...options,
                        ...(options.skipUrl ? {} : {url: getResourceURL(options)}),
                        elementSelector: GuideUtils.getGuideElementSelector('role-' + options.showRole),
                        class: 'visual_graph-role',
                        onNextClick: (guide, step) => {
                            GuideUtils.waitFor(step.elementSelector, 3)
                                .then(() => $(step.elementSelector).trigger('click'))
                                .then(() => guide.next());
                        }
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'resource-click-on-visual-graph-button',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.resource-click-on-visual-graph-button.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: RESOURCE_DEFAULT_TITLE}),
                        ...options,
                        ...(options.skipUrl ? {} : {url: getResourceURL(options)}),
                        elementSelector: GuideUtils.getGuideElementSelector('explore-visual'),
                        class: 'resource-click-on-visual-graph-button',
                        onNextClick: (guide, step) => {
                            GuideUtils.waitFor(step.elementSelector, 3)
                                .then(() => $(step.elementSelector).trigger('click'));
                        }
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'table-graph-explore',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const RoutingUtil = services.RoutingUtil;
            options.mainAction = 'table-graph';

            const steps = [
                {
                    guideBlockName: 'sparql-results-click-on-iri',
                    options: {
                        content: 'guide.step-intro.table-graph',
                        initPreviousStep: (services, stepId) => {
                            const currentStepId = services.ShepherdService.getCurrentStepId();
                            if (currentStepId === stepId) {
                                return Promise.resolve();
                            }
                            const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                            return previousStep.options.initPreviousStep(services, previousStep.options.id);
                        },
                        ...options
                    }
                },
                {
                    guideBlockName: 'resource-results-explain',
                    options: {
                        content: 'guide.step_plugin.table-graph-overview',
                        skipUrl: true,
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
                        },
                        ...options
                    }
                }
            ];

            if (angular.isArray(options.subSteps)) {
                options.subSteps.forEach((subStep) => {

                    switch (subStep.type) {
                        case 'link':
                            steps.push({
                                guideBlockName: 'resource-results-click-on-iri',
                                options: {
                                    content: 'guide.step_plugin.table-graph-link',
                                    skipUrl: true,
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
                                    },
                                    ...options,
                                    ...subStep
                                }
                            });
                            break;
                        case 'role':
                            steps.push({
                                guideBlockName: 'resource-click-on-role',
                                options: {
                                    content: 'guide.step_plugin.table-graph-role',
                                    skipUrl: true,
                                    showRole: subStep.role,
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
                                    },
                                    ...options,
                                    ...subStep
                                }
                            });
                            break;
                        case 'visual':
                            steps.push({
                                guideBlockName: 'resource-click-on-visual-graph-button',
                                options: {
                                    content: 'guide.step_plugin.table-graph-visual',
                                    skipUrl: true,
                                    initPreviousStep: (services, stepId) => {
                                        const currentStepId = services.ShepherdService.getCurrentStepId();
                                        if (currentStepId === stepId) {
                                            return Promise.resolve();
                                        }

                                        return GuideUtils.defaultInitPreviousStep(services, stepId);
                                    },
                                    ...options,
                                    ...subStep
                                }
                            });
                            steps.push({
                                guideBlockName: 'visual-graph-intro',
                                options: {
                                    extraContent: subStep.extraContentVisualIntro,
                                    forceReload: true,
                                    onNextClick: (guide) => {
                                        window.history.back();
                                        guide.next();
                                    },
                                    ...options,
                                    ...subStep
                                }
                            });
                            break;
                        case 'row':
                            steps.push({
                                guideBlockName: 'resource-results-row-explain',
                                options: {
                                    content: 'guide.step_plugin.table-graph-link',
                                    skipUrl: true,
                                    ...options,
                                    ...subStep
                                }
                            });
                            break;
                        case 'table':
                            steps.push({
                                guideBlockName: 'resource-results-explain',
                                options: {
                                    elementSelector: GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_ROWS_SELECTOR,
                                    class: 'visual_graph-table',
                                    skipUrl: true,
                                    placement: 'top',
                                    ...options,
                                    ...subStep
                                }
                            });
                            break;
                    }
                });
            }

            return steps;
        }
    }
]);
