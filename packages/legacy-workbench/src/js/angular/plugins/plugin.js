PluginRegistry.add('route', {
    'url': '/plugins',
    'module': 'graphdb.framework.plugins',
    'path': 'plugins/app',
    'chunk': 'plugins',
    'controller': 'PluginsCtrl',
    'templateUrl': 'pages/plugins.html',
    'title': 'menu.plugins.label',
    'helpInfo': 'view.plugins.helpInfo',
    'documentationUrl': 'using-plugins.html',
    'allowAuthorities': ['READ_REPO_{repoId}']
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Setup',
            labelKey: 'menu.setup.label',
            href: '#',
            order: 5,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: "icon-settings",
            guideSelector: 'menu-setup'
        },
        {
            label: 'Plugins',
            labelKey: 'menu.plugins.label',
            href: 'plugins',
            order: 25,
            parent: 'Setup',
            role: "IS_AUTHENTICATED_FULLY",
            guideSelector: 'sub-menu-plugins'
        }
    ]
});
