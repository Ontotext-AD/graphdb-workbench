PluginRegistry.add('route', {
    'url': '/graphs',
    'module': 'graphdb.framework.impex.export',
    'path': 'export/app',
    'chunk': 'export',
    'controller': 'ExportCtrl',
    'templateUrl': 'pages/export.html',
    'title': 'Graphs overview',
    'helpInfo': 'Graphs overview provides a list of the default graph and all named graphs in GraphDB. '
    + 'It can be used to inspect the statements in each graph, export the graph or clear the graph\'s data. '
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Explore',
            href: '#',
            order: 1,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-data'
        },
        {
            label: 'Graphs overview',
            href: 'graphs',
            order: 0,
            role: 'IS_AUTHENTICATED_FULLY',
            parent: 'Explore'
        }
    ]
});
