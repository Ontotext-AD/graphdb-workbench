PluginRegistry.add('route', {
    'url': '/sparql-editor',
    'module': 'graphdb.framework.sparql-editor',
    'path': 'sparql-editor/app',
    'controller': 'SparqlEditorCtrl',
    'templateUrl': 'pages/sparql-editor.html',
    'title': 'view.sparql-editor.title',
    'helpInfo': 'view.sparql-editor.helpInfo'
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'SPARQL_EDITOR',
            labelKey: 'menu.sparql-editor.label',
            href: 'sparql-editor',
            order: 2,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: "icon-sparql",
            guideSelector: 'menu-sparql-editor'
        }
    ]
});
