PluginRegistry.add('route', [
    {
        'url': '/similarity',
        'module': 'graphdb.framework.similarity',
        'path': 'similarity/app',
        'chunk': 'similarity',
        'controller': 'SimilarityCtrl',
        'templateUrl': 'pages/similarity-indexes.html',
        'title': 'view.similarity.indexes.title',
        'helpInfo': 'view.similarity.indexes.helpInfo',
        'documentationUrl': 'semantic-similarity-searches.html#text-based-similarity-searches',
        'allowAuthorities': ['READ_REPO_{repoId}']
    }, {
        'url': '/similarity/index/create',
        'module': 'graphdb.framework.similarity',
        'path': 'similarity/app',
        'chunk': 'similarity',
        'controller': 'CreateSimilarityIdxCtrl',
        'templateUrl': 'pages/create-index.html',
        'title': 'view.create.similarity.index.title',
        'helpInfo': 'view.create.similarity.index.helpInfo',
        'allowAuthorities': ['READ_REPO_{repoId}']
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Similarity',
            labelKey: 'menu.similarity.label',
            href: 'similarity',
            order: 40,
            parent: 'Explore',
            role: 'IS_AUTHENTICATED_FULLY',
            children: [{
                href: 'similarity/index/create',
                children: []
            }],
            guideSelector: 'sub-menu-similarity'
        }
    ]
});
