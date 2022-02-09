PluginRegistry.add('route', {
    'url': '/plugins',
    'module': 'graphdb.framework.plugins',
    'path': 'plugins/app',
    'chunk': 'plugins',
    'controller': 'PluginsCtrl',
    'templateUrl': 'pages/plugins.html',
    'title': 'Plugins',
    'helpInfo': 'Activate or deactivate plugins.'
});

PluginRegistry.add('main.menu', {
    'items': [
        {label: 'Setup', href: '#', order: 5, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"},
        {label: 'Plugins', href: 'plugins', order: 25, parent: 'Setup', role: "IS_AUTHENTICATED_FULLY"}
    ]
});
