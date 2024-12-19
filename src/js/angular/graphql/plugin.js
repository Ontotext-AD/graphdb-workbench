PluginRegistry.add('route', [
    {
        'url': '/graphql-playground',
        'templateUrl': 'pages/graphql/graphql-playground.html',
        'module': 'graphdb.framework.graphql',
        'path': 'graphql/app',
        'controller': 'GraphqlPlaygroundViewCtrl',
        'title': 'menu.graphql-playground.label',
        'helpInfo': 'graphql.helpInfo',
        'documentationUrl': 'graphql-playground.html'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'GraphQL',
            labelKey: 'menu.graphql.label',
            href: '#',
            order: 2.5,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: "fa-kit fa-gdb-graphql",
            guideSelector: 'menu-graphql'
        },
        {
            label: 'GraphQL Playground',
            labelKey: 'menu.graphql-playground.label',
            href: 'graphql-playground',
            order: 10,
            role: 'ROLE_USER',
            parent: 'GraphQL',
            guideSelector: 'sub-menu-graphql-playground'
        }]
});
