PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'table-graph-explore',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const $location = services.$location;
            const $route = services.$route;
            options.mainAction = 'table-graph';

            const steps = [
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step-intro.table-graph',
                        scrollToHandler: GuideUtils.scrollToTop,
                        elementSelector: GuideUtils.getSparqlResultsSelectorForIri(options.iri),
                        class: 'table-graph-instance-guide-dialog',
                        placement: 'top',
                        onNextClick: (guide, step) => {
                            GuideUtils.waitFor(step.elementSelector, 3)
                                .then(() => $(step.elementSelector).trigger('click'))
                                .then(() => guide.next());
                        },
                        initPreviousStep: (services, stepId) => new Promise((resolve, reject) => {
                            const currentStepId = services.ShepherdService.getCurrentStepId();
                            if (currentStepId === stepId) {
                                resolve();
                            } else {
                                const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                                previousStep.options.initPreviousStep(services, previousStep.options.id)
                                    .then(() => {
                                        resolve();
                                    })
                                    .catch((error) => {
                                        reject(error);
                                    });
                            }
                        })
                    }, options)
                }, {
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.table-graph-overview',
                        scrollToHandler: GuideUtils.scrollToTop,
                        elementSelector: GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_ROWS_SELECTOR,
                        class: 'table-graph-overview-guide-dialog',
                        placement: 'top',
                        initPreviousStep: (services, stepId) => new Promise((resolve, reject) => {
                            const currentStepId = services.ShepherdService.getCurrentStepId();
                            if (currentStepId === stepId) {
                                GuideUtils.defaultInitPreviousStep(services, stepId).then(() => resolve()).catch((error) => reject(error));
                            } else {
                                const url = `/resource?uri=${options.iri}&role=subject`;
                                if (url !== decodeURIComponent($location.url())) {
                                    $location.url(url);
                                    $route.reload();
                                    GuideUtils.waitFor(GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_ROWS_SELECTOR)
                                        .then(() => resolve())
                                        .catch((error) => reject(error));
                                } else {
                                    resolve();
                                }
                            }
                        })
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
                                    class: 'table-graph-link-guide-dialog',
                                    onNextClick: (guide, step) => {
                                        GuideUtils.waitFor(step.elementSelector, 3)
                                            .then(() => $(step.elementSelector).trigger('click'))
                                            .then(() => guide.next());
                                    },
                                    initPreviousStep: (services, stepId) => new Promise((resolve, reject) => {
                                        const linkUrl = `/resource?uri=${subStep.iri}&role=subject`;
                                        const tableGraphLinkUrl = `/resource?uri=${options.iri}&role=subject`;
                                        const url = decodeURIComponent($location.url());

                                        const currentStepId = services.ShepherdService.getCurrentStepId();

                                        if (currentStepId === stepId && tableGraphLinkUrl === url) {
                                            // this case is first link in the sequence before click the link, so we have to resolve it.
                                            resolve();
                                        } else if (currentStepId !== stepId && linkUrl === url) {
                                            // this case is first link in the sequence after click the link, so we have to call previous step.
                                            GuideUtils.defaultInitPreviousStep(services, stepId).then(() => resolve()).catch((error) => reject(error));
                                        } else {
                                            // this case is from second link we have to reload
                                            $location.url(linkUrl);
                                            $route.reload();
                                            GuideUtils.waitFor(GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_ROWS_SELECTOR)
                                                .then(() => resolve())
                                                .catch((error) => reject(error));
                                        }
                                    })
                                }, angular.extend({}, options, subStep))
                            });
                            break;
                        case 'role':
                            steps.push({
                                guideBlockName: 'clickable-element',
                                options: angular.extend({}, {
                                    content: 'guide.step_plugin.table-graph-role',
                                    elementSelector: GuideUtils.getGuideElementSelector('role-' + subStep.role),
                                    class: 'visual_graph-role-guide-dialog',
                                    onNextClick: (guide, step) => {
                                        GuideUtils.waitFor(step.elementSelector, 3)
                                            .then(() => $(step.elementSelector).trigger('click'))
                                            .then(() => guide.next());
                                    },
                                    initPreviousStep: (services, stepId) => new Promise((resolve, reject) => {
                                        const currentStepId = services.ShepherdService.getCurrentStepId();
                                        if (currentStepId === stepId) {
                                            resolve();
                                        } else {
                                            const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                                            previousStep.options.initPreviousStep(services, previousStep.options.id)
                                                .then(() => {
                                                    let url = $location.url();
                                                    url = url.substring(0, url.indexOf('role=') + 5);
                                                    url += subStep.role;
                                                    $location.url(url);
                                                    $route.reload();
                                                    GuideUtils.waitFor(GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_ROWS_SELECTOR)
                                                        .then(() => resolve())
                                                        .catch((error) => reject(error));
                                                })
                                                .catch((error) => {
                                                    reject(error);
                                                });
                                        }
                                    })
                                }, angular.extend({}, options, subStep))
                            });
                            break;
                        case 'visual':
                            steps.push({
                                guideBlockName: 'clickable-element',
                                options: angular.extend({}, {
                                    content: 'guide.step_plugin.table-graph-visual',
                                    elementSelector: GuideUtils.getGuideElementSelector('explore-visual'),
                                    class: 'table-graph-visual-button-guide-dialog',
                                    onNextClick: (guide, step) => {
                                        GuideUtils.waitFor(step.elementSelector, 3)
                                            .then(() => $(step.elementSelector).trigger('click'));
                                    },
                                    initPreviousStep: (services, stepId) => new Promise((resolve, reject) => {
                                        const currentStepId = services.ShepherdService.getCurrentStepId();

                                        if (currentStepId === stepId) {
                                            resolve();
                                        } else {
                                            GuideUtils.defaultInitPreviousStep(services, stepId).then(() => resolve()).catch((error) => reject(error));
                                        }
                                    })
                                }, angular.extend({}, options, subStep))
                            });
                            steps.push({
                                guideBlockName: 'read-only-element',
                                options: angular.extend({}, {
                                    content: 'guide.step_plugin.visual_graph_intro.content',
                                    extraContent: subStep.extraContentVisualIntro,
                                    url: '/graphs-visualizations',
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
                                    class: 'visual_graph-row-guide-dialog'
                                }, angular.extend({}, options, subStep))
                            });
                            break;
                        case 'table':
                            steps.push({
                                guideBlockName: 'read-only-element',
                                options: angular.extend({}, {
                                    elementSelector: GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_ROWS_SELECTOR,
                                    class: 'visual_graph-table-guide-dialog',
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
