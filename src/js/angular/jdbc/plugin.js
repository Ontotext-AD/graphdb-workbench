PluginRegistry.add('route', [
    {
    'url': '/jdbc',
    'module': 'graphdb.framework.jdbc',
    'path': 'jdbc/app',
    'chunk': 'jdbc',
    'controller': 'JdbcListCtrl',
    'templateUrl': 'pages/jdbc.html',
    'title': 'JDBC configuration',
    'helpInfo': 'JDBC driver configuration to allow SQL access to repository data'
    },
    {
        'url': '/jdbc/configuration/create',
        'module': 'graphdb.framework.jdbc',
        'path': 'jdbc/app',
        'chunk': 'jdbc',
        'controller': 'JdbcCreateCtrl',
        'templateUrl': 'pages/jdbc-create.html',
        'title': 'JDBC configuration',
        'helpInfo': 'JDBC driver configuration to allow SQL access to repository data'
    }
    ]);

PluginRegistry.add('main.menu', {
    'items': [
        {label: 'Setup', href: '#', order: 5, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"},
        {label: 'JDBC', href: 'jdbc', order: 50, parent: 'Setup', role: "IS_AUTHENTICATED_FULLY"}
    ]
});
