PluginRegistry.add('route', [
    {
        'url': '/guides',
        'module': 'graphdb.framework.guides',
        'path': 'guides/app',
        'templateUrl': 'pages/guides.html',
        'title': 'view.guides.title',
        'controller': 'GuidesCtrl',
        'helpInfo': 'view.guides.helpInfo'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Guides',
            labelKey: 'menu.guides.label',
            order: 5,
            parent: 'Help',
            icon: 'paste',
            href: 'guides',
            guideSelector: 'sub-menu-guide'
        }
    ]
});
