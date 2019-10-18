PluginRegistry.add('route', [
    {
        'url': '/resource',
        'module': 'graphdb.framework.explore',
        'chunk': 'explore-resource',
        'path': 'explore/app',
        'controller': 'ExploreCtrl',
        'templateUrl': 'pages/explore.html',
        'title': 'Resource'
    }, {
        'url': '/resource/edit',
        'module': 'graphdb.framework.explore',
        'chunk': 'edit-resource',
        'path': 'explore/app',
        'controller': 'EditResourceCtrl',
        'templateUrl': 'pages/edit.html',
        'title': 'Resource'
    }, {
        'url': '/resource/:any*',
        'module': 'graphdb.framework.explore',
        'chunk': 'any-resource',
        'path': 'explore/app',
        'controller': 'ExploreCtrl',
        'templateUrl': 'pages/explore.html',
        'title': 'Resource'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {label: 'Explore', href: '#', order: 1, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-data"}
    ]
});
