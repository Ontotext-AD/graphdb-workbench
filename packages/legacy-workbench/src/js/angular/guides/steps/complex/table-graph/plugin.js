const TABLE_GRAPH_EXPLORE_DEFAULT_TITLE = 'guide.step-action.table-graph';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'table-graph-intro',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step-intro.table-graph',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: TABLE_GRAPH_EXPLORE_DEFAULT_TITLE }),
                        class: 'table-graph-instance',
                        placement: 'top',
                        ...options,
                        scrollToHandler: GuideUtils.scrollToTop,
                        elementSelector: GuideUtils.getSparqlResultsSelectorForIri(options.iri),
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
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'table-graph-explain-table',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const RoutingUtil = services.RoutingUtil;
            return [
                {
                    guideBlockName: 'read-only-element',
                    options: {
                        content: 'guide.step_plugin.table-graph-overview',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: TABLE_GRAPH_EXPLORE_DEFAULT_TITLE }),
                        class: 'table-graph-overview',
                        placement: 'top',
                        ...options,
                        scrollToHandler: GuideUtils.scrollToTop,
                        elementSelector: GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_ROWS_SELECTOR,
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
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'table-graph-click-on-iri',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const RoutingUtil = services.RoutingUtil;
            const stepIri = options.subStep.iri;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.table-graph-link',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: TABLE_GRAPH_EXPLORE_DEFAULT_TITLE }),
                        elementSelector: GuideUtils.getSparqlResultsSelectorForIri(stepIri),
                        class: 'table-graph-link',
                        ...options,
                        onNextClick: (guide, step) => {
                            GuideUtils.waitFor(step.elementSelector, 3)
                                .then(() => $(step.elementSelector).trigger('click'))
                                .then(() => guide.next());
                        },
                        initPreviousStep: (services, stepId) => {
                            const linkUrl = `/resource?uri=${stepIri}&role=subject`;
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
                    }
            }
            ]
        }
    },
    {
      guideBlockName: 'table-graph-click-on-role',
      getSteps: (options, services) => {
          const GuideUtils = services.GuideUtils;
          const RoutingUtil = services.RoutingUtil;
          const stepRole = options.subStep.role;
          return [
              {
                  guideBlockName: 'clickable-element',
                  options: {
                      content: 'guide.step_plugin.table-graph-role',
                      // If mainAction is set the title will be set automatically
                      ...(options.mainAction ? {} : { title: TABLE_GRAPH_EXPLORE_DEFAULT_TITLE }),
                      class: 'visual_graph-role',
                      ...options,
                      elementSelector: GuideUtils.getGuideElementSelector('role-' + stepRole),
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
                                  url += stepRole;
                                  RoutingUtil.navigate(url);
                                  return GuideUtils.waitFor(GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_ROWS_SELECTOR);
                              });
                      }
                  }
              }
          ]
      }
    },
    {
        guideBlockName: 'table-graph-click-explore-graph',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.table-graph-visual',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: TABLE_GRAPH_EXPLORE_DEFAULT_TITLE }),
                        class: 'table-graph-visual-button',
                        elementSelector: GuideUtils.getGuideElementSelector('explore-visual'),
                        ...options,
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
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'table-graph-explain-connections',
        getSteps: (options, services) => {
            return [
                {
                    guideBlockName: 'read-only-element',
                    options: {
                        content: 'guide.step_plugin.visual_graph_intro.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: TABLE_GRAPH_EXPLORE_DEFAULT_TITLE }),
                        extraContent: options.subStep.extraContentVisualIntro,
                        placement: 'left',
                        canBePaused: false,
                        forceReload: true,
                        ...options,
                        url: 'graphs-visualizations',
                        elementSelector: '.graph-visualization',
                        onNextClick: (guide) => {
                            window.history.back();
                            guide.next();
                        }
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'table-graph-row-substep',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;

            return [
                {
                    guideBlockName: 'read-only-element',
                    options: {
                        class: 'visual_graph-row',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: TABLE_GRAPH_EXPLORE_DEFAULT_TITLE }),
                        ...options,
                        ...options.subStep,
                        elementSelector: GuideUtils.getSparqlResultsSelectorForRow(options.subStep.row)
                    }
                }
            ]
        }
    },
    {
      guideBlockName: 'table-graph-table-substep',
      getSteps: (options, services) => {
          const GuideUtils = services.GuideUtils;

          return [
              {
                  guideBlockName: 'read-only-element',
                  options: {
                      class: 'visual_graph-table',
                      // If mainAction is set the title will be set automatically
                      ...(options.mainAction ? {} : { title: TABLE_GRAPH_EXPLORE_DEFAULT_TITLE }),
                      placement: 'top',
                      ...options,
                      ...options.subStep,
                      elementSelector: GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_ROWS_SELECTOR
                  }
              }
          ]
      }
    },
    {
        guideBlockName: 'table-graph-explore',
        getSteps: (options, services) => {
            options.mainAction = 'table-graph';

            const steps = [
                {
                    guideBlockName: 'table-graph-intro', options: {...options}
                }, {
                    guideBlockName: 'table-graph-explain-table', options: {...options}
                }
            ];

            if (angular.isArray(options.subSteps)) {
                options.subSteps.forEach((subStep) => {

                    switch (subStep.type) {
                        case 'link':
                            steps.push({
                                guideBlockName: 'table-graph-click-on-iri', options: { ...options, subStep }
                            });
                            break;
                        case 'role':
                            steps.push({
                                guideBlockName: 'table-graph-click-on-role', options: { ...options, subStep }
                            });
                            break;
                        case 'visual':
                            steps.push({
                                guideBlockName: 'table-graph-click-explore-graph', options: { ...options, subStep }
                            });
                            steps.push({
                                guideBlockName: 'table-graph-explain-connections', options: { ...options, subStep }
                            });
                            break;
                        case 'row':
                            steps.push({
                                guideBlockName: 'table-graph-row-substep', options: { ...options, subStep }
                            });
                            break;
                        case 'table':
                            steps.push({
                                guideBlockName: 'table-graph-table-substep', options: { ...options, subStep }
                            });
                            break;
                    }
                });
            }

            return steps;
        }
    }
]);
