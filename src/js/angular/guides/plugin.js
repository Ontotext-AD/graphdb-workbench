PluginRegistry.add('route', [
    {
        url: '/guides',
        module: 'graphdb.framework.guides',
        path: 'guides/app',
        templateUrl: 'pages/guides.html',
        title: 'view.guides.title',
        controller: 'GuidesCtrl',
        helpInfo: 'view.guides.helpInfo',
        documentationUrl: 'index.html',
        'allowAuthorities': ['READ_REPO_{repoId}']
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Guides',
            labelKey: 'menu.guides.label',
            order: 0,
            parent: 'Help',
            icon: 'paste',
            href: 'guides',
            role: 'ROLE_USER',
            guideSelector: 'sub-menu-guide'
        }
    ]
});
