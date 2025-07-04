PluginRegistry.add('route', {
    'url': '/rdfrank',
    'module': 'graphdb.framework.rdfrank',
    'path': 'rdfrank/app',
    'chunk': 'rdfrank',
    'controller': 'RDFRankCtrl',
    'templateUrl': 'pages/rdfrank.html',
    'title': 'view.rdf.rank.title',
    'helpInfo': 'view.rdf.rank.helpInfo',
    'documentationUrl': 'ranking-results.html',
    'allowAuthorities': ['READ_REPO_{repoId}']
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'RDF Rank',
            labelKey: 'view.rdf.rank.title',
            href: 'rdfrank',
            order: 45,
            parent: 'Setup',
            role: 'IS_AUTHENTICATED_FULLY',
            guideSelector: 'sub-menu-rdf-rank',
            testSelector: 'sub-menu-rdf-rank'
        }
    ]
});
