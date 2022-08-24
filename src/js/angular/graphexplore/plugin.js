PluginRegistry.add('route', [
    {
        'url': '/hierarchy',
        'module': 'graphdb.framework.graphexplore',
        'path': 'graphexplore/app',
        'chunk': 'hierarchy',
        'controller': 'RdfClassHierarchyCtlr',
        'templateUrl': 'pages/rdfClassHierarchyInfo.html',
        'title': 'view.class.hierarchy.title',
        'reloadOnSearch': false,
        'helpInfo': 'view.class.hierarchy.helpInfo'
    }, {
        'url': '/domain-range-graph',
        'module': 'graphdb.framework.graphexplore',
        'path': 'graphexplore/app',
        'chunk': 'domain-range-graph',
        'controller': 'DomainRangeGraphCtlr',
        'templateUrl': 'pages/domainRangeInfo.html',
        'title': 'view.domain.range.graph.title',
        'helpInfo': 'view.domain.range.graph.helpInfo'
    }, {
        'url': '/relationships',
        'module': 'graphdb.framework.graphexplore',
        'path': 'graphexplore/app',
        'chunk': 'relationships',
        'controller': 'DependenciesChordCtrl',
        'templateUrl': 'pages/dependencies.html',
        'title': 'view.class.relationships.title',
        'helpInfo': 'view.class.relationships.helpInfo'
    }, {
        'url': '/graphs-visualizations',
        'module': 'graphdb.framework.graphexplore',
        'path': 'graphexplore/app',
        'chunk': 'graphs-visualizations',
        'controller': 'GraphsVisualizationsCtrl',
        'templateUrl': 'pages/graphs-visualizations.html',
        'title': 'visual.graph.label',
        'reloadOnSearch': false,
        'helpInfo': 'view.visual.graph.helpInfo'
    }, {
        'url': '/graphs-visualizations/config/save/:configName?',
        'module': 'graphdb.framework.graphexplore',
        'path': 'graphexplore/app',
        'chunk': 'graph-config',
        'controller': 'GraphConfigCtrl',
        'templateUrl': 'pages/graph-config/saveGraphConfig.html',
        'title': 'view.create.visual.graph.title',
        'helpInfo': 'view.create.visual.graph.helpInfo'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Explore',
            labelKey: 'menu.explore.label',
            href: '#',
            order: 1,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-data',
            guideSelector: 'menu-explore'
        }, {
            label: 'Class relationships',
            labelKey: 'menu.class.relationships.label',
            href: 'relationships',
            order: 2,
            parent: 'Explore',
            guideSelector: 'sub-menu-class-relationships'
        }, {
            label: 'Class hierarchy',
            labelKey: 'menu.class.hierarchy.label',
            href: 'hierarchy',
            order: 1,
            parent: 'Explore',
            guideSelector: 'menu-class-hierarchy'
        }, {
            label: 'Visual graph',
            labelKey: 'visual.graph.label',
            href: 'graphs-visualizations',
            order: 5,
            parent: 'Explore',
            children: [{
                href: 'graphs-visualizations/config/save',
                children: []
            }],
            guideSelector: 'sub-menu-visual-graph'
        }
    ]
});
