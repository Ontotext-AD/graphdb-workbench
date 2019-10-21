PluginRegistry.add('route', [
    {
        'url': '/users',
        'module': 'graphdb.framework.security',
        'path': 'security/app',
        'chunk': 'security',
        'controller': 'UsersCtrl',
        'templateUrl': 'js/angular/security/templates/users.html',
        'title': 'Users and Access',
        'helpInfo': 'The Users and Access view is used to manage the users and their access to the GraphDB repositories. '
        + 'You can also enable or disable the security of the entire Workbench. '
        + 'When disabled, everyone has full access to the repositories and the admin functionality. '
    }, {
        'url': '/user/create',
        'module': 'graphdb.framework.security',
        'path': 'security/app',
        'chunk': 'security',
        'controller': 'AddUserCtrl',
        'templateUrl': 'js/angular/security/templates/user.html',
        'title': 'Create new user'
    }, {
        'url': '/login',
        'module': 'graphdb.framework.security',
        'path': 'security/app',
        'chunk': 'security',
        'controller': 'LoginCtrl',
        'templateUrl': 'pages/login.html',
        'title': 'Login'
    }, {
        'url': '/user/:userId',
        'module': 'graphdb.framework.security',
        'path': 'security/app',
        'chunk': 'security',
        'controller': 'EditUserCtrl',
        'templateUrl': 'js/angular/security/templates/user.html',
        'title': 'Edit user'
    }, {
        'url': '/settings',
        'module': 'graphdb.framework.security',
        'path': 'security/app',
        'chunk': 'security',
        'controller': 'ChangeUserPasswordSettingsCtrl',
        'templateUrl': 'js/angular/security/templates/user.html',
        'title': 'Settings'
    }, {
        'url': '/accessdenied',
        'templateUrl': 'pages/accessdenied.html',
        'title': 'Access Denied'
    }, {
        'url': '/rolesmappings',
        'module': 'graphdb.framework.security',
        'path': 'security/app',
        'chunk': 'security',
        'controller': 'RolesMappingController',
        'templateUrl': 'js/angular/security/templates/roles.html',
        'title': 'Roles per Request Mapping'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Setup',
            href: '#',
            order: 5,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-settings'
        },
        {
            label: 'Users and Access', href: 'users', order: 2, parent: 'Setup', role: 'ROLE_ADMIN',
            children: [{
                href: 'user/create',
                children: []
            }]
        },
        {
            label: 'My Settings',
            href: 'settings',
            order: 6,
            parent: 'Setup',
            role: 'ROLE_USER'
        }
    ]
});
