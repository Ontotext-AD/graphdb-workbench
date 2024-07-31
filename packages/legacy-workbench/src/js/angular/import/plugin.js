PluginRegistry.add('route', {
    'url': '/import',
    'module': 'graphdb.framework.impex.import',
    'path': 'import/app',
    'chunk': 'import',
    'controller': 'ImportViewCtrl',
    'templateUrl': 'pages/import.html',
    'title': 'common.import',
    'reloadOnSearch': false,
    'helpInfo': 'view.import.helpInfo'
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Import',
            labelKey: 'common.import',
            href: 'import',
            order: 0,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-import',
            guideSelector: 'menu-import',
            children: []
        }
    ]
});
