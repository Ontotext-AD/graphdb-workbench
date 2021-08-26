PluginRegistry.add('route', [
    {
    'url': '/smart-update',
    'module': 'graphdb.framework.smart-update',
    'path': 'smart-update/app',
    'chunk': 'smart-update',
    'controller': 'SmartUpdateListCtrl',
    'templateUrl': 'pages/smart-update.html',
    'title': 'Smart Updates',
    'helpInfo': 'Smart Update template to allow Kafka updates to repository data'
    },
    {
        'url': '/smart-update/templates/create',
        'module': 'graphdb.framework.smart-update',
        'path': 'smart-update/app',
        'chunk': 'smart-update',
        'controller': 'SmartUpdateCreateCtrl',
        'templateUrl': 'pages/smart-update-create.html',
        'helpInfo': 'Smart Update template configuration tool'
    }
    ]);

PluginRegistry.add('main.menu', {
    'items': [
        {label: 'Setup', href: '#', order: 5, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"},
        {label: 'Smart Update', href: 'smart-update', order: 51, parent: 'Setup', role: "IS_AUTHENTICATED_FULLY"}
    ]
});
