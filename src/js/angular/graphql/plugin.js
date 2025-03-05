PluginRegistry.add('route', [
    {
        'url': '/graphql/endpoints',
        'templateUrl': 'js/angular/graphql/templates/graphql-endpoint-management.html',
        'module': 'graphdb.framework.graphql',
        'path': 'graphql/app',
        'controller': 'GraphqlEndpointManagementViewCtrl',
        'title': 'menu.graphql-endpoint-management.label',
        'helpInfo': 'graphql.endpoints_management.helpInfo',
        'documentationUrl': 'graphql-endpoint-management.html',
        'allowAuthorities': ['WRITE_REPO_{repoId}', 'WRITE_REPO_{repoId}:GRAPHQL']
    },
    {
        'url': '/graphql/endpoint/create',
        'templateUrl': 'js/angular/graphql/templates/create-graphql-endpoint.html',
        'module': 'graphdb.framework.graphql',
        'path': 'graphql/app',
        'controller': 'CreateGraphqlEndpointViewCtrl',
        'title': 'menu.create-graphql-endpoint.label',
        'helpInfo': 'graphql.create_endpoint.helpInfo',
        'documentationUrl': 'create-graphql-endpoint.html',
        'allowAuthorities': ['WRITE_REPO_{repoId}:GRAPHQL', 'WRITE_REPO_{repoId}:GRAPHQL']
    },
    {
        'url': '/graphql/playground',
        'templateUrl': 'js/angular/graphql/templates/graphql-playground.html',
        'module': 'graphdb.framework.graphql',
        'path': 'graphql/app',
        'controller': 'GraphqlPlaygroundViewCtrl',
        'title': 'menu.graphql-playground.label',
        'helpInfo': 'graphql.playground.helpInfo',
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
            icon: "fa-kit fa-gdb-graphql"
        },
        {
            label: 'Endpoint Management',
            labelKey: 'menu.graphql-endpoint-management.label',
            href: 'graphql/endpoints',
            order: 10,
            role: 'ROLE_REPO_MANAGER',
            parent: 'GraphQL',
            children: [
                {
                    href: 'graphql/endpoint/create',
                    children: []
                }
            ]
        },
        {
            label: 'GraphQL Playground',
            labelKey: 'menu.graphql-playground.label',
            href: 'graphql/playground',
            order: 15,
            role: 'IS_AUTHENTICATED_FULLY',
            parent: 'GraphQL'
        }]
});
