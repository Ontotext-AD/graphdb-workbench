PluginRegistry.add('guide.step', [
    {
        'guideBlockName': 'visual-graph',
        'getSteps': (options, GuideUtils, $rootScope) => [
            {
                'guideBlockName': 'click-main-menu',
                'options': angular.extend({}, {
                    'label': 'menu_explore_visual_graph',
                    'menuSelector': 'menu-explore',
                    'submenuSelector': 'sub-menu-visual-graph'
                }, options)
            }, {
                'guideBlockName': 'input-element',
                'options': angular.extend({}, {
                    'title': 'guide.step_plugin.visual_graph_input_IRI.title',
                    'content': 'guide.step_plugin.visual_graph_input_IRI.content',
                    'forceReload': true,
                    'url': '/graphs-visualizations',
                    'elementSelector': GuideUtils.getGuideElementSelector('graphVisualisationSearchInputNotConfigured', ' input'),
                    'onNextValidate': (step) => GuideUtils.validateTextInput(step.elementSelector, step.easyGraphInputText)
                }, options)
            }, {
                'guideBlockName': 'clickable-element',
                'options': angular.extend({}, {
                    'title': 'guide.step_plugin.visual_graph_show_autocomplete.title',
                    'content': 'guide.step_plugin.visual_graph_show_autocomplete.content',
                    'url': '/graphs-visualizations',
                    'elementSelector': GuideUtils.getGuideElementSelector(`autocomplete-${options.clickOnIRI}`),
                    'onNextClick': (guide, step) => {
                        $(step.elementSelector).trigger('click');
                    },
                    'canBePaused': false,
                    'forceReload': true
                }, options)
            }
        ]
    },
    {
        'guideBlockName': 'visual-graph-expand',
        'getSteps': (options, GuideUtils, $rootScope) => [
            {
                'guideBlockName': 'read-only-element',
                'options': angular.extend({}, {
                    'title': 'guide.step_plugin.visual-graph-expand.title',
                    'content': 'guide.step_plugin.visual-graph-expand.content',
                    'url': '/graphs-visualizations',
                    'elementSelector': `.node-wrapper[id^="${options.clickOnIRI}"] circle`,
                    'advanceOn': {
                        selector: `.node-wrapper[id^="${options.clickOnIRI}"] circle`,
                        event: 'dblclick'
                    },
                    'onNextClick': (guide, step) => {
                        GuideUtils.graphVizExpandNode(step.elementSelector);
                        guide.next();
                    },
                    'beforeShowPromise': GuideUtils.awaitAlphaDropD3($rootScope)
                }, options)
            }
        ]
    },
    {
        'guideBlockName': 'visual-graph-properties',
        'getSteps': (options, GuideUtils, $rootScope) => [
            {
                'guideBlockName': 'read-only-element',
                'options': angular.extend({}, {
                    'title': 'guide.step_plugin.visual-graph-properties.title',
                    'content': 'guide.step_plugin.visual-graph-properties.content',
                    'url': '/graphs-visualizations',
                    'elementSelector': `.node-wrapper[id^="${options.clickOnIRI}"] circle`,
                    'advanceOn': {
                        selector: `.node-wrapper[id^="${options.clickOnIRI}"] circle`,
                        event: 'click'
                    },
                    'onNextClick': (guide, step) => {
                        GuideUtils.graphVizShowNodeInfo(step.elementSelector);
                        guide.next();
                    },
                    'beforeShowPromise': GuideUtils.awaitAlphaDropD3($rootScope)
                }, options)
            },
            {
                // rdf-info-side-panel, node-info
                'guideBlockName': 'read-only-element',
                'options': angular.extend({}, {
                    'title': 'guide.step_plugin.visual-graph-properties-side-panel.title',
                    'content': 'guide.step_plugin.visual-graph-properties-side-panel.content',
                    'url': '/graphs-visualizations',
                    'elementSelector': '.rdf-info-side-panel',
                    'placement': 'left',
                    'beforeShowPromise': GuideUtils.deferredShow(500),
                    'advanceOn': {
                        selector: GuideUtils.getGuideElementSelector('close-info-panel'),
                        event: 'click'
                    },
                    'onNextClick': (guide, step) => {
                        $(GuideUtils.getGuideElementSelector('close-info-panel')).trigger('click');
                    }
                }, options)
            }
        ]
    }
]);
