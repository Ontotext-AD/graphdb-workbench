PluginRegistry.add('route', [
    {
        'url': '/ontorefine',
        'module': 'graphdb.framework.ontorefine',
        'path': 'ontorefine/app',
        'chunk': 'ontorefine',
        'controller': 'OntoRefineCtrl',
        'templateUrl': 'pages/ontorefine.html',
        'title': 'view.ontoRefine.title',
        'helpInfo': 'view.ontoRefine.helpInfo'
    }, {
        'url': '/ontorefine/:page',
        'module': 'graphdb.framework.ontorefine',
        'path': 'ontorefine/app',
        'chunk': 'ontorefine',
        'controller': 'OntoRefineCtrl',
        'templateUrl': 'pages/ontorefine.html',
        'title': 'view.ontoRefine.title',
        'helpInfo': 'view.ontoRefine.helpInfo'
    }, {
        'url': '/ontorefine/project?project=:project',
        'module': 'graphdb.framework.ontorefine',
        'path': 'ontorefine/app',
        'chunk': 'ontorefine',
        'controller': 'OntoRefineCtrl',
        'templateUrl': 'pages/ontorefine.html',
        'title': 'view.ontoRefine.title',
        'helpInfo': 'view.ontoRefine.helpInfo'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Import',
            labelKey: 'common.import',
            href: '#',
            order: 0,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-import'
        },
        {
            label: 'Tabular (OntoRefine)',
            labelKey: 'menu.ontoRefine.label',
            href: 'ontorefine',
            order: 2,
            parent: 'Import',
            role: 'ROLE_USER'
        }
    ]
});
