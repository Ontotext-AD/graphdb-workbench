PluginRegistry.add('route', {
    'url': '/graphs',
    'module': 'graphdb.framework.impex.export',
    'path': 'export/app',
    'chunk': 'export',
    'controller': 'ExportCtrl',
    'templateUrl': 'pages/export.html',
    'title': 'view.export.ctr.title',
    'helpInfo': 'view.export.ctr.helpInfo '
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Explore',
            labelKey: 'menu.explore.label',
            href: '#',
            order: 1,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-data'
        },
        {
            label: 'Graphs overview',
            labelKey: 'menu.graphs.overview.label',
            href: 'graphs',
            order: 0,
            role: 'IS_AUTHENTICATED_FULLY',
            parent: 'Explore'
        }
    ]
});
