PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'visual-graph',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
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
                        onNextValidate: (step) => GuideUtils.validateTextInput(step.elementSelector, step.easyGraphInputText)
                    }, options)
                }, {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.visual_graph_show_autocomplete.content',
                        url: '/graphs-visualizations',
                        elementSelector: GuideUtils.getGuideElementSelector(`autocomplete-${options.iri}`),
                        onNextClick: (guide, step) => {
                            $(step.elementSelector).trigger('click');
                        },
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
            const elementSelector = `.node-wrapper[id^="${options.iri}"] circle`;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        title: 'guide.step_plugin.visual-graph-expand.title',
                        content: 'guide.step_plugin.visual-graph-expand.content',
                        url: '/graphs-visualizations',
                        canBePaused: false,
                        elementSelector,
                        advanceOn: {
                            selector: `.node-wrapper[id^="${options.iri}"] circle`,
                            event: 'dblclick'
                        },
                        onNextClick: (guide, stepDescription) => {
                            GuideUtils.graphVizExpandNode(stepDescription.elementSelector);
                            guide.getCurrentStep().hide();
                            GuideUtils.awaitAlphaDropD3(null, $rootScope)()
                                .then(() => {
                                    guide.next();
                                });
                        },
                        beforeShowPromise: GuideUtils.awaitAlphaDropD3(elementSelector, $rootScope)
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
            const steps = [
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        title: 'guide.step_plugin.visual-graph-properties.title',
                        content: 'guide.step_plugin.visual-graph-properties.content',
                        url: '/graphs-visualizations',
                        elementSelector,
                        canBePaused: false,
                        advanceOn: {
                            selector: `.node-wrapper[id^="${options.iri}"] circle`,
                            event: 'click'
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
                        canBePaused: false,
                        placement: 'left',
                        beforeShowPromise: GuideUtils.deferredShow(500)
                    }, options)
                }
            ];

            if (angular.isArray(options.focusProperties)) {
                options.focusProperties.forEach(focusProperty => {
                    if (!angular.isObject(focusProperty)) {
                        focusProperty = {
                            property: focusProperty
                        };
                    }
                    const translationIdSuffix = focusProperty.property === 'types' ? '-types' : '-property';
                    steps.push({
                        guideBlockName: 'read-only-element',
                        options: angular.extend({}, {
                            title: 'guide.step_plugin.visual-graph-properties-focus' + translationIdSuffix + '.title',
                            content: 'guide.step_plugin.visual-graph-properties-focus' + translationIdSuffix + '.content',
                            url: '/graphs-visualizations',
                            canBePaused: false,
                            elementSelector: GuideUtils.getGuideElementSelector('graph-visualization-node-info-' + focusProperty.property),
                            focusProperty: focusProperty.property,
                            extraContent: focusProperty.message
                        }, options)
                    });
                });
            }

            steps.push({
                guideBlockName: 'clickable-element',
                options: angular.extend({}, {
                    title: 'guide.step_plugin.visual-graph-properties-side-panel-close.title',
                    content: 'guide.step_plugin.visual-graph-properties-side-panel-close.content',
                    url: '/graphs-visualizations',
                    canBePaused: false,
                    elementSelector: GuideUtils.getGuideElementSelector('close-info-panel'),
                    advanceOn: {
                        selector: GuideUtils.getGuideElementSelector('close-info-panel'),
                        event: 'click'
                    },
                    onNextClick: () => {
                        $(GuideUtils.getGuideElementSelector('close-info-panel')).trigger('click');
                    }
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
                        extraPadding: 40,
                        elementSelector,
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
                        extraPadding: 10,
                        elementSelector,
                        beforeShowPromise: GuideUtils.awaitAlphaDropD3(elementSelector, $rootScope)
                    }, options)
                }
            ];
        }
    }
]);
