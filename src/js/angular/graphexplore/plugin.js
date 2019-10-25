PluginRegistry.add('route', [
    {
        'url': '/hierarchy',
        'module': 'graphdb.framework.graphexplore',
        'path': 'graphexplore/app',
        'chunk': 'hierarchy',
        'controller': 'RdfClassHierarchyCtlr',
        'templateUrl': 'pages/rdfClassHierarchyInfo.html',
        'title': 'Class hierarchy',
        'reloadOnSearch': false,
        'helpInfo': 'This diagram shows the hierarchy of RDF classes by number of instances. '
        + 'The biggest circles are the parent classes and the nested ones are their children. '
        + 'Hover over a given class to see its subclasses or zoom in a '
        + 'nested circle (RDF class) for further exploration. '
    }, {
        'url': '/domain-range-graph',
        'module': 'graphdb.framework.graphexplore',
        'path': 'graphexplore/app',
        'chunk': 'domain-range-graph',
        'controller': 'DomainRangeGraphCtlr',
        'templateUrl': 'pages/domainRangeInfo.html',
        'title': 'Domain-Range graph',
        'helpInfo': 'This diagram shows the classes and properties that lead to a given '
        + 'RDF class, which plays the role of <b>range</b> for all properties on the left of it, and '
        + '<b>domain</b> for all properties on the right of it.'
        + 'You can navigate to another class '
        + 'by double clicking on it.'
    }, {
        'url': '/relationships',
        'module': 'graphdb.framework.graphexplore',
        'path': 'graphexplore/app',
        'chunk': 'relationships',
        'controller': 'DependenciesChordCtrl',
        'templateUrl': 'pages/dependencies.html',
        'title': 'Class relationships',
        'helpInfo': 'This diagram shows the relationships between RDF classes, '
        + 'where a relationship is represented by links between the individual instances of two classes. '
        + 'Each link is an RDF statement where the subject is an instance of one class, the object is an instance of another class, '
        + 'and the link is the predicate. '
        + 'Depending on the number of links between the instances of two classes, the bundle can be '
        + 'thicker or thinner and it gets the colour of the class with more incoming links. '
        + 'The links can be in both directions. '
    }, {
        'url': '/graphs-visualizations',
        'module': 'graphdb.framework.graphexplore',
        'path': 'graphexplore/app',
        'chunk': 'graphs-visualizations',
        'controller': 'GraphsVisualizationsCtrl',
        'templateUrl': 'pages/graphs-visualizations.html',
        'title': 'Visual graph',
        'reloadOnSearch': false,
        'helpInfo': 'Provides a way to create a visual representation of parts of the data graph. You start from a single resource and the resources connected '
        + ' to it or from a graph query result. Click on resources to show their connections too.'
    }, {
        'url': '/graphs-visualizations/config/save/:configName?',
        'module': 'graphdb.framework.graphexplore',
        'path': 'graphexplore/app',
        'chunk': 'graph-config',
        'controller': 'GraphConfigCtrl',
        'templateUrl': 'pages/graph-config/saveGraphConfig.html',
        'title': 'Create visual graph config',
        'helpInfo': 'A visual graph config defines the SPARQL queries used to retrieve nodes and edges in the visual graph, as well as'
        + ' the starting point of visualisation.'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Explore',
            href: '#',
            order: 1,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-data'
        }, {
            label: 'Class relationships',
            href: 'relationships',
            order: 2,
            parent: 'Explore'
        }, {
            label: 'Class hierarchy',
            href: 'hierarchy',
            order: 1,
            parent: 'Explore'
        }, {
            label: 'Visual graph',
            href: 'graphs-visualizations',
            order: 5,
            parent: 'Explore',
            children: [{
                href: 'graphs-visualizations/config/save',
                children: []
            }]
        }
    ]
});
