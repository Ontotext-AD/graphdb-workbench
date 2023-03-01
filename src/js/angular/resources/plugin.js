PluginRegistry.add('route', {
    'url': '/monitor/resources',
    'module': 'graphdb.framework.jmx.resources',
    'path': 'resources/app',
    'chunk': 'resources',
    'controller': 'ResourcesCtrl',
    'templateUrl': 'pages/monitor/resources.html',
    'title': 'view.resource.monitoring.title',
    'helpInfo': 'view.resource.monitoring.helpInfo'
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Monitor',
            labelKey: 'menu.monitor.label',
            href: '#',
            order: 3,
            role: 'ROLE_MONITORING',
            icon: 'icon-monitoring',
            guideSelector: 'menu-monitor'
        }, {
            label: 'Resources',
            labelKey: 'menu.resources.label',
            href: 'monitor/resources',
            // Added role requirement here to assert that users cannot see Resources menu item
            role: 'ROLE_MONITORING',
            order: 2,
            parent: 'Monitor',
            guideSelector: 'sub-menu-resources'
        }
    ]
});
