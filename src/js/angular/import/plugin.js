PluginRegistry.add('route', {
    'url': '/import',
    'module': 'graphdb.framework.impex.import',
    'path': 'import/app',
    'chunk': 'import',
    'controller': 'CommonCtrl',
    'templateUrl': 'pages/import.html',
    'title': 'menu.import.label',
    'reloadOnSearch': false,
    'helpInfo': 'view.import.helpInfo'
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Import',
            labelKey: 'menu.import.label',
            href: '#',
            order: 0,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-import'
        }, {
            label: 'RDF',
            labelKey: 'menu.rdf.label',
            href: 'import',
            order: 1,
            parent: 'Import',
            role: 'IS_AUTHENTICATED_FULLY'
        }
    ]
});
