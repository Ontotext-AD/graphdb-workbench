PluginRegistry.add('route', {
    'url': '/monitor/queries',
    'module': 'graphdb.framework.jmx.queries',
    'path': 'queries/app',
    'chunk': 'monitor-queries',
    'controller': 'QueriesCtrl',
    'templateUrl': 'pages/monitor/queries.html',
    'title': 'Query and Update monitoring',
    'helpInfo': 'The Queries and Updates monitoring view shows all running queries or updates in GraphDB. '
    + 'A query or update can be terminated by pressing the Abort button.'
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Monitor',
            href: '#',
            order: 1,
            role: 'ROLE_REPO_MANAGER',
            icon: 'icon-monitoring'
        }, {
            label: 'Queries and Updates',
            href: 'monitor/queries',
            order: 1,
            parent: 'Monitor'
        }
    ]
});
