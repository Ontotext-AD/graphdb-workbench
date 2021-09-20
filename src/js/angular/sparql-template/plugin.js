PluginRegistry.add('route', [
    {
    'url': '/sparql-templates',
    'module': 'graphdb.framework.sparql-template',
    'path': 'sparql-template/app',
    'chunk': 'sparql-template',
    'controller': 'SparqlTemplatesCtrl',
    'templateUrl': 'pages/sparql-templates.html',
    'title': 'SPARQL Templates',
    'helpInfo': 'Allows storing configurations for future updates of repository data'
    },
    {
        'url': '/sparql-template/create',
        'module': 'graphdb.framework.sparql-template',
        'path': 'sparql-template/app',
        'chunk': 'sparql-template',
        'controller': 'SparqlTemplateCreateCtrl',
        'templateUrl': 'pages/sparql-template-create.html',
        'title': 'Create SPARQL Templates',
        'helpInfo': 'SPARQL Template configuration tool'
    }
    ]);

PluginRegistry.add('main.menu', {
    'items': [
        {label: 'Setup', href: '#', order: 5, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"},
        {label: 'SPARQL Templates', href: 'sparql-templates', order: 51, parent: 'Setup', role: "IS_AUTHENTICATED_FULLY"}
    ]
});
