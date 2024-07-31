PluginRegistry.add('route', {
    'url': '/monitor/queries',
    'module': 'graphdb.framework.jmx.queries',
    'path': 'queries/app',
    'chunk': 'monitor-queries',
    'controller': 'QueriesCtrl',
    'templateUrl': 'pages/monitor/queries.html',
    'title': 'view.query.and.update.monitoring.title',
    'helpInfo': 'view.query.and.update.monitoring.helpInfo',
    'documentationUrl': 'query-monitoring.html'
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Queries and Updates',
            labelKey: 'menu.queries.and.updates.label',
            href: 'monitor/queries',
            order: 1,
            parent: 'Monitor',
            guideSelector: 'sub-menu-queries-and-updates',
            children: []
        }
    ]
});
