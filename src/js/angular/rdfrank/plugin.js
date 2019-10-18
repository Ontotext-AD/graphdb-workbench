PluginRegistry.add('route', {
    'url': '/rdfrank',
    'module': 'graphdb.framework.rdfrank',
    'path': 'rdfrank/app',
    'chunk': 'rdfrank',
    'controller': 'RDFRankCtrl',
    'templateUrl': 'pages/rdfrank.html',
    'title': 'RDF Rank',
    'helpInfo': 'RDF Rank is an algorithm that identifies the more important or more popular ' +
    'entities in the repository by examining their interconnectedness. The popularity of entities' +
    ' can then be used to order the query results.'
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Setup',
            href: '#',
            order: 5,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-settings'
        },
        {
            label: 'RDF Rank',
            href: 'rdfrank',
            order: 45,
            parent: 'Setup',
            role: 'IS_AUTHENTICATED_FULLY'
        }
    ]
});
