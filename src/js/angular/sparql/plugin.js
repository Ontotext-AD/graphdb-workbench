PluginRegistry.add('route', {
    'url': '/sparql',
    'module': 'graphdb.framework.sparql',
    'path': 'sparql/app',
    'chunk': 'sparql',
    'controller': 'QueryEditorCtrl',
    'templateUrl': 'pages/sparql.html',
    'title': 'SPARQL Query & Update',
    'helpInfo': 'The SPARQL Query & Update view is a unified editor for queries and updates. '
    + 'Use any type of SPARQL query and click Run to execute it.'
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'SPARQL',
            href: 'sparql',
            order: 2,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: "icon-sparql"
        }
    ]
});
