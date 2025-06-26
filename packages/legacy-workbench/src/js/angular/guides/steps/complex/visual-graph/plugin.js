const disableAllNodes = () => () => {
    $('.node-wrapper').addClass('disable-visual-graph-node');
};

const enableAllNodes = () => () => {
    $('.node-wrapper').removeClass('disable-visual-graph-node');
};

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'visual-graph',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const RoutingUtil = services.RoutingUtil;
            options.mainAction = 'visual-graph';

            return [
                {
                    guideBlockName: 'click-main-menu',
                    options: angular.extend({}, {
                        menu: 'visual-graph',
                        showIntro: true
                    }, options)
                }, {
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.visual_graph_input_IRI.content',
                        forceReload: true,
                        url: '/graphs-visualizations',
                        elementSelector: GuideUtils.getGuideElementSelector('graphVisualisationSearchInputNotConfigured', ' input'),
                        class: 'visual-graph-input-iri-guide-dialog',
                        onNextValidate: (step) => Promise.resolve(GuideUtils.validateTextInput(step.elementSelector, step.easyGraphInputText))
                    }, options)
                }, {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.visual_graph_show_autocomplete.content',
                        url: '/graphs-visualizations',
                        elementSelector: GuideUtils.getGuideElementSelector(`autocomplete-${options.iri}`),
                        class: 'visual-graph-show-autocomplete-guide-dialog',
                        onNextClick: (guide, step) => GuideUtils.waitFor(step.elementSelector, 3).then(() => $(step.elementSelector).trigger('click')),
                        canBePaused: false,
                        forceReload: true
                    }, options)
                }, {
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.visual_graph_intro.content',
                        url: '/graphs-visualizations',
                        elementSelector: '.graph-visualization',
                        placement: 'left',
                        onPreviousClick: () => {
                            RoutingUtil.navigate('/graphs-visualizations');
                            const searchInputSelector = GuideUtils.getGuideElementSelector('graphVisualisationSearchInputNotConfigured', ' input');
                            return GuideUtils.waitFor(searchInputSelector, 3)
                                .then(() => {
                                    GuideUtils.validateTextInput(searchInputSelector, options.easyGraphInputText);
                                });
                        },
                        initPreviousStep: () => {
                            const url = '/graphs-visualizations?uri=' + options.iri;
                            if (url !== decodeURIComponent(RoutingUtil.getCurrentRoute())) {
                                const URL = '/graphs-visualizations?uri=' + options.iri;
                                RoutingUtil.navigate(URL);
                                return GuideUtils.waitFor(`.node-wrapper[id^="${options.iri}"] circle`, 3);
                            }
                            return Promise.resolve();
                        },
                        canBePaused: false,
                        forceReload: true
                    }, options)
                }
            ];
        }
    },
    {
        guideBlockName: 'visual-graph-expand',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const $rootScope = services.$rootScope;
            const $route = services.$route;
            const elementSelector = `.node-wrapper[id^="${options.iri}"] circle`;

            // Expands visual graph when a node is double-clicked.
            const dblClickFunction = (guide) => () => {
                GuideUtils.graphVizExpandNode(elementSelector);
                guide.getCurrentStep().hide();
                GuideUtils.awaitAlphaDropD3(null, $rootScope)()
                    .then(() => {
                        guide.next();
                    });
            };

            return [
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        title: 'guide.step_plugin.visual-graph-expand.title',
                        content: 'guide.step_plugin.visual-graph-expand.content',
                        url: '/graphs-visualizations',
                        canBePaused: false,
                        class: 'visual-graph-expand-node-guide-dialog',
                        elementSelector,
                        // Disable default behavior of service when element is clicked.
                        advanceOn: undefined,
                        onNextClick: (guide) => {
                            GuideUtils.graphVizExpandNode(elementSelector);
                            guide.getCurrentStep().hide();
                            GuideUtils.awaitAlphaDropD3(null, $rootScope)()
                                .then(() => {
                                    guide.next();
                                });
                        },
                        show: (guide) => () => {
                            // Add "dblclick" listener to the element. Processing of double-click event is disabled for the visual graph when guide is started.
                            // So we have expanded the graph manually when a selected node is double-clicked.
                            $(elementSelector).on('dblclick.onNodeDbClicked', dblClickFunction(guide));
                        },
                        hide: () => () => {
                            // Remove the "dblclick" listener of element. It is important when step is hided.
                            $(elementSelector).off('dblclick.onNodeDbClicked');
                        },
                        beforeShowPromise: () => {
                            $route.reload();
                            return GuideUtils.deferredShow(50)()
                                .then(() => {
                                    return GuideUtils.awaitAlphaDropD3(elementSelector, $rootScope)();
                                });
                        },
                        initPreviousStep: (services, stepId) => {
                            const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                            return previousStep.options.initPreviousStep(services, previousStep.id)
                                .then(() => {
                                    const currentStepId = services.ShepherdService.getCurrentStepId();
                                    // Skip expanding of node if last step is "visual-graph-expand"
                                    if (currentStepId === stepId) {
                                        return Promise.resolve;
                                    }

                                    GuideUtils.graphVizExpandNode(elementSelector);
                                    return GuideUtils.deferredShow(50)()
                                        .then(() => {
                                            return GuideUtils.awaitAlphaDropD3(null, $rootScope)();
                                        });
                                });
                        }
                    }, options)
                }
            ];
        }
    },
    {
        guideBlockName: 'visual-graph-properties',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const $rootScope = services.$rootScope;
            const elementSelector = `.node-wrapper[id^="${options.iri}"] circle`;

            let mouseClickTimeStamp;
            let mouseEventTimer;

            // Expands Node info sidebar panel when a node is clicked.
            const onClick = (services, guide) => (event) => {
                if (mouseEventTimer) {
                    // Cancels expansion of the sidebar panel if user double-clicked.
                    if (event.timeStamp - mouseClickTimeStamp < 400) {
                        services.$timeout.cancel(mouseEventTimer);
                        mouseEventTimer = null;
                    }
                } else {
                    mouseClickTimeStamp = event.timeStamp;
                    mouseEventTimer = services.$timeout(function () {
                        GuideUtils.graphVizShowNodeInfo(elementSelector);
                        mouseEventTimer = null;
                        guide.next();
                    }, 500);
                }
            };

            const steps = [
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        title: 'guide.step_plugin.visual-graph-properties.title',
                        content: 'guide.step_plugin.visual-graph-properties.content',
                        url: '/graphs-visualizations',
                        class: 'visual-graph-show-properties-intro-guide-dialog',
                        elementSelector,
                        canBePaused: false,
                        // Disable default behavior of service when element is clicked.
                        advanceOn: undefined,
                        show: (guide) => () => {
                            // Add "click" listener to the element. Processing of click event is disabled for the visual graph when guide is started.
                            // So we have to open side panel info manually when a selected node is clicked.
                            $(elementSelector).on('click.onNodeClicked', onClick(services, guide));
                        },
                        hide: () => () => {
                            // Remove the "click" listener of element. It is important when step is hided.
                            $(elementSelector).off('click.onNodeClicked');
                        },
                        onNextClick: (guide, step) => {
                            GuideUtils.graphVizShowNodeInfo(step.elementSelector);
                            guide.next();
                        },
                        beforeShowPromise: GuideUtils.awaitAlphaDropD3(elementSelector, $rootScope)
                    }, options)
                },
                {
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        title: 'guide.step_plugin.visual-graph-properties-side-panel.title',
                        content: 'guide.step_plugin.visual-graph-properties-side-panel.content',
                        url: '/graphs-visualizations',
                        elementSelector: '.rdf-side-panel-content',
                        class: 'visual-graph-side-panel-content-guide-dialog',
                        canBePaused: false,
                        placement: 'left',
                        beforeShowPromise: GuideUtils.deferredShow(500),
                        onPreviousClick: () => new Promise(function (resolve) {
                            GuideUtils.waitFor(closeButtonSelector, 3)
                                .then(() => {
                                    $(closeButtonSelector).trigger('click');
                                    resolve();
                                }).catch(() => resolve());
                        })
                    }, options)
                }
            ];

            if (angular.isArray(options.focusProperties)) {
                options.focusProperties.forEach((focusProperty) => {
                    if (!angular.isObject(focusProperty)) {
                        focusProperty = {
                            property: focusProperty
                        };
                    }
                    const translationIdSuffix = focusProperty.property === 'types' ? '-types' : '-property';
                    const content = focusProperty.skipGenericMessage && focusProperty.message ?
                        null : 'guide.step_plugin.visual-graph-properties-focus' + translationIdSuffix + '.content';
                    steps.push({
                        guideBlockName: 'read-only-element',
                        options: angular.extend({}, {
                            title: 'guide.step_plugin.visual-graph-properties-focus' + translationIdSuffix + '.title',
                            content: content,
                            url: '/graphs-visualizations',
                            class: 'visual-graph-properties-focus-guide-dialog',
                            canBePaused: false,
                            placement: 'left',
                            elementSelector: GuideUtils.getGuideElementSelector('graph-visualization-node-info-' + focusProperty.property),
                            focusProperty: focusProperty.property,
                            extraContent: focusProperty.message
                        }, options)
                    });
                });
            }

            const closeButtonSelector = GuideUtils.getGuideElementSelector('close-info-panel');
            steps.push({
                guideBlockName: 'clickable-element',
                options: angular.extend({}, {
                    title: 'guide.step_plugin.visual-graph-properties-side-panel-close.title',
                    content: 'guide.step_plugin.visual-graph-properties-side-panel-close.content',
                    url: '/graphs-visualizations',
                    canBePaused: false,
                    placement: 'left',
                    class: 'visual-graph-properties-side-panel-close-guide-dialog',
                    elementSelector: closeButtonSelector,
                    advanceOn: {
                        selector: closeButtonSelector,
                        event: 'click'
                    },
                    beforeShowPromise: () => {
                        // We have to be sure that node info sidebar is open. It is needed when this step is loaded when next step "Previous"
                        // button is clicked.
                        GuideUtils.graphVizShowNodeInfo(elementSelector);
                        return GuideUtils.deferredShow(500)();
                    },
                    onNextClick: () => GuideUtils.waitFor(closeButtonSelector, 3).then(() => $(closeButtonSelector).trigger('click'))
                }, options)
            });

            return steps;
        }
    },
    {
        guideBlockName: 'visual-graph-link-focus',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const $rootScope = services.$rootScope;
            const elementSelector = `.link-wrapper[id^="${options.fromIri}>${options.toIri}"]`;
            return [
                {
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        title: 'guide.step_plugin.visual-graph-link-focus.title',
                        content: 'guide.step_plugin.visual-graph-link-focus.content',
                        url: '/graphs-visualizations',
                        canBePaused: false,
                        class: 'visual-graph-link-focus-guide-dialog',
                        elementSelector,
                        show: disableAllNodes,
                        hide: enableAllNodes,
                        beforeShowPromise: GuideUtils.awaitAlphaDropD3(elementSelector, $rootScope)
                    }, options)
                }
            ];
        }
    },
    {
        guideBlockName: 'visual-graph-node-focus',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const $rootScope = services.$rootScope;
            const elementSelector = `.node-wrapper[id^="${options.iri}"] circle`;
            return [
                {
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        title: 'guide.step_plugin.visual-graph-node-focus.title',
                        content: 'guide.step_plugin.visual-graph-node-focus.content',
                        url: '/graphs-visualizations',
                        canBePaused: false,
                        elementSelector,
                        class: 'visual-graph-node-focus-guide-dialog',
                        show: disableAllNodes,
                        hide: enableAllNodes,
                        beforeShowPromise: GuideUtils.awaitAlphaDropD3(elementSelector, $rootScope),
                        initPreviousStep: (services, stepId) => {
                            if (GuideUtils.isVisible(elementSelector)) {
                                return Promise.resolve();
                            }

                            const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                            return previousStep.options.initPreviousStep(services, previousStep.id);
                        }
                    }, options)
                }
            ];
        }
    }
]);
