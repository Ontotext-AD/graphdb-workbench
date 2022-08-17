PluginRegistry.add('guide.step', [
    {
        'guideBlockName': 'visual-graph',
        'getSteps': (options, GuideUtils) => [
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
                }, options)
            }, {
                'guideBlockName': 'clickable-element',
                'options': angular.extend({}, {
                    'title': 'guide.step_plugin.visual_graph_show_autocomplete.title',
                    'content': 'guide.step_plugin.visual_graph_show_autocomplete.content',
                    'url': '/graphs-visualizations',
                    'elementSelector': '.search-rdf-resources #auto-complete-results-wrapper',
                    'canBePaused': false,
                    'forceReload': true,
                }, options)
            },
            {
                'guideBlockName': 'read-only-element',
                'options': angular.extend({}, {
                    'title': 'guide.step_plugin.visual-graph.entity.title',
                    'content': 'guide.step_plugin.visual-graph.entity.content',
                    'url': '/graphs-visualizations',
                    canBePaused: false,
                    'elementSelector': `.node-wrapper[id^="${options.clickOnIRI}"]`,
                }, options)
            }
        ]
    }
]);
