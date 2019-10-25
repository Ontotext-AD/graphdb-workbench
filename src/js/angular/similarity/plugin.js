PluginRegistry.add('route', [
    {
        'url': '/similarity',
        'module': 'graphdb.framework.similarity',
        'path': 'similarity/app',
        'chunk': 'similarity',
        'controller': 'SimilarityCtrl',
        'templateUrl': 'pages/similarity-indexes.html',
        'title': 'Similarity indexes',
        'helpInfo': 'Similarity indexes help you look up semantically similar entities and text.'
    }, {
        'url': '/similarity/index/create',
        'module': 'graphdb.framework.similarity',
        'path': 'similarity/app',
        'chunk': 'similarity',
        'controller': 'CreateSimilarityIdxCtrl',
        'templateUrl': 'pages/create-index.html',
        'title': 'Create similarity index',
        'helpInfo': 'Index name and select query are required. Add Semantic Vectors parameters if you want.'
    }
]);

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
            label: 'Similarity',
            href: 'similarity',
            order: 40,
            parent: 'Explore',
            role: 'IS_AUTHENTICATED_FULLY',
            children: [{
                href: 'similarity/index/create',
                children: []
            }]
        }
    ]
});
