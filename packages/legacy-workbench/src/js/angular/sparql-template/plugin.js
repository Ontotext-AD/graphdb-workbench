PluginRegistry.add('route', [
    {
    'url': '/sparql-templates',
    'module': 'graphdb.framework.sparql-template',
    'path': 'sparql-template/app',
    'chunk': 'sparql-template',
    'controller': 'SparqlTemplatesCtrl',
    'templateUrl': 'pages/sparql-templates.html',
    'title': 'view.sparql.template.title',
    'helpInfo': 'view.sparql.template.helpInfo'
    },
    {
        'url': '/sparql-template/create',
        'module': 'graphdb.framework.sparql-template',
        'path': 'sparql-template/app',
        'chunk': 'sparql-template',
        'controller': 'SparqlTemplateCreateCtrl',
        'templateUrl': 'pages/sparql-template-create.html',
        'title': 'view.create.sparql.template.title',
        'helpInfo': 'view.create.sparql.template.helpInfo'
    }
    ]);

PluginRegistry.add('main.menu', {
    'items': [
        {label: 'Setup', labelKey: 'menu.setup.label', href: '#', order: 5, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-settings", guideSelector: 'menu-setup'},
        {label: 'SPARQL Templates', labelKey: 'menu.sparql.template.label', href: 'sparql-templates', order: 51, parent: 'Setup', role: "IS_AUTHENTICATED_FULLY", guideSelector: 'sub-menu-sparql-templates'}
    ]
});
