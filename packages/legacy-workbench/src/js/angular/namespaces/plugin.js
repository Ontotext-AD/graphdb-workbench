PluginRegistry.add('route', {
    'url': '/namespaces',
    'module': 'graphdb.framework.namespaces',
    'chunk': 'namespaces',
    'path': 'namespaces/app',
    'controller': 'NamespacesCtrl',
    'templateUrl': 'pages/namespaces.html',
    'title': 'menu.namespaces.label',
    'helpInfo': 'view.namespaces.helpInfo',
    'documentationUrl': 'configuring-a-repository.html#namespaces-defined-for-the-repository',
    'allowAuthorities': ['READ_REPO_{repoId}'],
});

PluginRegistry.add('main.menu', {
    'items': [
       {
            label: 'Namespaces',
            labelKey: 'menu.namespaces.label',
            href: 'namespaces',
            order: 30,
            parent: 'Setup',
            guideSelector: 'sub-menu-namespaces',
            testSelector: 'sub-menu-namespaces',
        },
    ],
});
