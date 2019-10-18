PluginRegistry.add('route', {
    'url': '/connectors',
    'module': 'graphdb.framework.externalsync',
    'path': 'externalsync/app',
    'chunk': 'externalsync',
    'controller': 'ConnectorsCtrl',
    'templateUrl': 'pages/connectorsInfo.html',
    'title': 'Connector management',
    'helpInfo': 'The Connector management view is used to create and manage GraphDB connector instances.'
});

PluginRegistry.add('main.menu', {
    'items': [
        {label: 'Setup', href: '#', order: 5, role: 'IS_AUTHENTICATED_FULLY', icon: 'icon-settings'},
        {label: 'Connectors', href: 'connectors', order: 10, parent: 'Setup', role: 'IS_AUTHENTICATED_FULLY'}
    ]
});
