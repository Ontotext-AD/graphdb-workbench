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
            order: 3,
            // Changed to role user as now users can monitor their own queries
            role: 'ROLE_USER',
            icon: 'icon-monitoring'
        }, {
            label: 'Queries and Updates',
            href: 'monitor/queries',
            order: 1,
            parent: 'Monitor'
        }
    ]
});
