PluginRegistry.add('route', {
    'url': '/monitor/queries',
    'module': 'graphdb.framework.jmx.queries',
    'path': 'queries/app',
    'chunk': 'monitor-queries',
    'controller': 'QueriesCtrl',
    'templateUrl': 'pages/monitor/queries.html',
    'title': 'view.query.and.update.monitoring.title',
    'helpInfo': 'view.query.and.update.monitoring.helpInfo'
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Monitor',
            labelKey: 'menu.monitor.label',
            href: '#',
            order: 3,
            // Changed to role user as now users can monitor their own queries
            role: 'ROLE_USER',
            icon: 'icon-monitoring',
            guideSelector: 'menu-monitor'
        }, {
            label: 'Queries and Updates',
            labelKey: 'menu.queries.and.updates.label',
            href: 'monitor/queries',
            order: 1,
            parent: 'Monitor',
            guideSelector: 'sub-menu-queries-and-updates'
        }
    ]
});
