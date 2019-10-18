PluginRegistry.add('route', {
    'url': '/namespaces',
    'module': 'graphdb.framework.namespaces',
    'chunk': 'namespaces',
    'path': 'namespaces/app',
    'controller': 'NamespacesCtrl',
    'templateUrl': 'pages/namespaces.html',
    'title': 'Namespaces',
    'helpInfo': 'The Namespaces view provides an overview of all namespaces used in your data. '
    + 'Here you can add, remove and modify them. '
});

PluginRegistry.add('main.menu', {
    'items': [
        {label: 'Setup', href: '#', order: 5, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"},
        {label: 'Namespaces', href: 'namespaces', order: 30, parent: 'Setup'}
    ]
});
