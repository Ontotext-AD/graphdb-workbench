PluginRegistry.add('route', [
    {
        'url': '/jdbc',
        'module': 'graphdb.framework.jdbc',
        'path': 'jdbc/app',
        'chunk': 'jdbc',
        'controller': 'JdbcListCtrl',
        'templateUrl': 'pages/jdbc.html',
        'title': 'view.jdbc.title',
        'helpInfo': 'view.jdbc.helpInfo'
    },
    {
        'url': '/jdbc/configuration/create',
        'module': 'graphdb.framework.jdbc',
        'path': 'jdbc/app',
        'chunk': 'jdbc',
        'controller': 'JdbcCreateCtrl',
        'templateUrl': 'pages/jdbc-create.html',
        'title': 'view.jdbc.create.title',
        'helpInfo': 'view.jdbc.create.helpInfo'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {label: 'JDBC', labelKey: 'menu.jdbc.label', href: 'jdbc', order: 50, parent: 'Setup', role: "IS_AUTHENTICATED_FULLY", guideSelector: 'sub-menu-jdbs'}
    ]
});
