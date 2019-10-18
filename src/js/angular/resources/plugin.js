PluginRegistry.add('route', {
    'url': '/monitor/resources',
    'module': 'graphdb.framework.jmx.resources',
    'path': 'resources/app',
    'chunk': 'resources',
    'controller': 'ResourcesCtrl',
    'templateUrl': 'pages/monitor/resources.html',
    'title': 'Resource monitoring',
    'helpInfo': 'The Resource monitoring view shows the usage of various system resources, '
    + 'such as memory and CPU, for the currently active location.'
});

PluginRegistry.add('main.menu', {
    'items': [
        {label: 'Monitor', href: '#', order: 4, role: 'ROLE_REPO_MANAGER', icon: 'icon-monitoring'},
        {label: 'Resources', href: 'monitor/resources', order: 2, parent: 'Monitor'}
    ]
});
