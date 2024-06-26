PluginRegistry.add('route', [
    {
        'url': '/jdbc',
        'module': 'graphdb.framework.jdbc',
        'path': 'jdbc/app',
        'chunk': 'jdbc',
        'controller': 'JdbcListCtrl',
        'templateUrl': 'pages/jdbc.html',
        'title': 'view.jdbc.title',
        'helpInfo': 'view.jdbc.helpInfo',
        'documentationUrl': 'sql-access-over-jdbc.html',
        'allowAuthorities': ['READ_REPO_{repoId}']
    },
    {
        'url': '/jdbc/configuration/create',
        'module': 'graphdb.framework.jdbc',
        'path': 'jdbc/app',
        'chunk': 'jdbc',
        'controller': 'JdbcCreateCtrl',
        'templateUrl': 'pages/jdbc-create.html',
        'title': 'view.jdbc.create.title',
        'helpInfo': 'view.jdbc.create.helpInfo',
        'allowAuthorities': ['READ_REPO_{repoId}']
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {label: 'Setup', labelKey: 'menu.setup.label', href: '#', order: 5, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-settings", guideSelector: 'menu-setup'},
        {label: 'JDBC', labelKey: 'menu.jdbc.label', href: 'jdbc', order: 50, parent: 'Setup', role: "IS_AUTHENTICATED_FULLY", guideSelector: 'sub-menu-jdbs'}
    ]
});
