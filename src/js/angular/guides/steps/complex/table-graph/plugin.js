PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'table-graph-explore',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'table-graph';

            const steps = [
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step-intro.table-graph',
                        scrollToHandler: GuideUtils.scrollToTop,
                        elementSelector: GuideUtils.getSparqlResultsSelectorForIri(options.iri),
                        onNextClick: (guide, step) => {
                            GuideUtils.waitFor(step.elementSelector, 3)
                                .then(() => $(step.elementSelector).trigger('click'))
                                .then(() => guide.next());
                        }
                    }, options)
                }, {
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.table-graph-overview',
                        scrollToHandler: GuideUtils.scrollToTop,
                        elementSelector: GuideUtils.getSparqlResultsSelector(),
                        placement: 'top'
                    }, options)
                }
            ];

            if (angular.isArray(options.subSteps)) {
                options.subSteps.forEach((subStep) => {
                    if (subStep.type === 'link') {
                        steps.push({
                            guideBlockName: 'clickable-element',
                            options: angular.extend({}, {
                                content: 'guide.step_plugin.table-graph-link',
                                elementSelector: GuideUtils.getSparqlResultsSelectorForIri(subStep.iri),
                                onNextClick: (guide, step) => {
                                    GuideUtils.waitFor(step.elementSelector, 3)
                                        .then(() => $(step.elementSelector).trigger('click'))
                                        .then(() => guide.next());
                                }
                            }, angular.extend({}, options, subStep))
                        });
                    } else if (subStep.type === 'role') {
                        steps.push({
                            guideBlockName: 'clickable-element',
                            options: angular.extend({}, {
                                content: 'guide.step_plugin.table-graph-role',
                                elementSelector: GuideUtils.getGuideElementSelector('role-' + subStep.role),
                                onNextClick: (guide, step) => {
                                    GuideUtils.waitFor(step.elementSelector, 3)
                                        .then(() => $(step.elementSelector).trigger('click'))
                                        .then(() => guide.next());
                                }
                            }, angular.extend({}, options, subStep))
                        });
                    } else if (subStep.type === 'visual') {
                        steps.push({
                            guideBlockName: 'clickable-element',
                            options: angular.extend({}, {
                                content: 'guide.step_plugin.table-graph-visual',
                                elementSelector: GuideUtils.getGuideElementSelector('explore-visual'),
                                onNextClick: (guide, step) => {
                                    GuideUtils.waitFor(step.elementSelector, 3)
                                        .then(() => $(step.elementSelector).trigger('click'));
                                }
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
                                onNextClick: (guide, step) => {
                                    window.history.back();
                                    guide.next();
                                }
                            }, angular.extend({}, options, subStep))
                        });
                    } else if (subStep.type === 'row') {
                        steps.push({
                            guideBlockName: 'read-only-element',
                            options: angular.extend({}, {
                                elementSelector: GuideUtils.getSparqlResultsSelectorForRow(subStep.row)
                            }, angular.extend({}, options, subStep))
                        });
                    } else if (subStep.type === 'table') {
                        steps.push({
                            guideBlockName: 'read-only-element',
                            options: angular.extend({}, {
                                elementSelector: GuideUtils.getSparqlResultsSelector()
                            }, angular.extend({}, options, subStep))
                        });
                    }
                });
            }

            return steps;
        }
    }
]);
