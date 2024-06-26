PluginRegistry.add('route', [
    {
        'url': '/resource',
        'module': 'graphdb.framework.explore',
        'chunk': 'explore',
        'path': 'explore/app',
        'controller': 'ExploreCtrl',
        'templateUrl': 'pages/explore.html',
        'title': 'view.resource.title'
    }, {
        'url': '/resource/edit',
        'module': 'graphdb.framework.explore',
        'chunk': 'explore',
        'path': 'explore/app',
        'controller': 'EditResourceCtrl',
        'templateUrl': 'pages/edit.html',
        'title': 'view.resource.title'
    }, {
        'url': '/resource/:any*',
        'module': 'graphdb.framework.explore',
        'chunk': 'explore',
        'path': 'explore/app',
        'controller': 'ExploreCtrl',
        'templateUrl': 'pages/explore.html',
        'title': 'view.resource.title'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [{
        label: 'Explore',
        labelKey: 'menu.explore.label',
        href: '#',
        order: 1,
        role: 'IS_AUTHENTICATED_FULLY',
        icon: "icon-data",
        guideSelector: 'menu-explore'
    }]
});
