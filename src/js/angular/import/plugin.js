PluginRegistry.add('route', {
    'url': '/import',
    'module': 'graphdb.framework.impex.import',
    'path': 'import/app',
    'chunk': 'import',
    'controller': 'CommonCtrl',
    'templateUrl': 'pages/import.html',
    'title': 'Import',
    'reloadOnSearch': false,
    'helpInfo': 'The Import view allows you to import RDF data into GraphDB. '
    + 'Import data from local files, from files on the server where the workbench is located, '
    + 'from a remote URL (with a format extension or by specifying the data format), '
    + 'or by pasting the RDF data in the Text area tab. '
    + 'Each import method supports different serialisation formats.'
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Import',
            href: '#',
            order: 0,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-import'
        }, {
            label: 'RDF',
            href: 'import',
            order: 1,
            parent: 'Import',
            role: 'IS_AUTHENTICATED_FULLY'
        }
    ]
});
