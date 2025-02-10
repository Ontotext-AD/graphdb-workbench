PluginRegistry.add('route', {
    'url': '/sparql',
    'module': 'graphdb.framework.sparql-editor',
    'path': 'sparql-editor/app',
    'chunk': 'sparql',
    'controller': 'SparqlEditorCtrl',
    'templateUrl': 'pages/sparql-editor.html',
    'title': 'view.sparql-editor.title',
    'helpInfo': 'view.sparql-editor.helpInfo',
    'reloadOnSearch': false,
    'documentationUrl': 'sparql-queries.html',
    'allowAuthorities': ['READ_REPO_{repoId}']
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'SPARQL',
            labelKey: 'menu.sparql.label',
            href: 'sparql',
            order: 2,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: "icon-sparql",
            guideSelector: 'menu-sparql'
        }
    ]
});
