PluginRegistry.add('route', {
    'url': '/connectors',
    'module': 'graphdb.framework.externalsync',
    'path': 'externalsync/app',
    'chunk': 'externalsync',
    'controller': 'ConnectorsCtrl',
    'templateUrl': 'pages/connectorsInfo.html',
    'title': 'view.connector.management.title',
    'helpInfo': 'view.connector.management.helpInfo'
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Connectors',
            labelKey: 'menu.connectors.label',
            href: 'connectors',
            order: 10,
            parent: 'Setup',
            role: 'IS_AUTHENTICATED_FULLY',
            guideSelector: 'sub-menu-connectors'
        }
    ]
});
