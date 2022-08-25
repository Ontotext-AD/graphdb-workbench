PluginRegistry.add('route', [
    {
        'url': '/similarity',
        'module': 'graphdb.framework.similarity',
        'path': 'similarity/app',
        'chunk': 'similarity',
        'controller': 'SimilarityCtrl',
        'templateUrl': 'pages/similarity-indexes.html',
        'title': 'view.similarity.indexes.title',
        'helpInfo': 'view.similarity.indexes.helpInfo'
    }, {
        'url': '/similarity/index/create',
        'module': 'graphdb.framework.similarity',
        'path': 'similarity/app',
        'chunk': 'similarity',
        'controller': 'CreateSimilarityIdxCtrl',
        'templateUrl': 'pages/create-index.html',
        'title': 'view.create.similarity.index.title',
        'helpInfo': 'view.create.similarity.index.helpInfo'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Setup',
            labelKey: 'menu.setup.label',
            href: '#',
            order: 5,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-settings',
            guideSelector: 'sub-menu-setup'
        },
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
