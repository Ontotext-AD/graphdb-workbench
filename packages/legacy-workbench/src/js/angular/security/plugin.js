PluginRegistry.add('route', [
    {
        'url': '/users',
        'module': 'graphdb.framework.security',
        'path': 'security/app',
        'chunk': 'security',
        'controller': 'UsersCtrl',
        'templateUrl': 'js/angular/security/templates/users.html',
        'title': 'menu.users.and.access.label',
        'helpInfo': 'view.users.access.helpInfo'
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
        'title': 'view.login.title'
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
        'title': 'view.settings.title'
    }, {
        'url': '/accessdenied',
        'templateUrl': 'pages/accessdenied.html',
        'title': 'view.access.denied.title'
    }, {
        'url': '/rolesmappings',
        'module': 'graphdb.framework.security',
        'path': 'security/app',
        'chunk': 'security',
        'controller': 'RolesMappingController',
        'templateUrl': 'js/angular/security/templates/roles.html',
        'title': 'view.roles.mapping.title'
    }, {
        'url': '/ux-test1',
        'templateUrl': 'pages/ux-test1.html',
        'controller': 'uxTestCtrl',
        'title': 'UX Test'
    }, {
        'url': '/ux-test2',
        'templateUrl': 'pages/ux-test2.html',
        'controller': 'uxTestCtrl',
        'title': 'UX Test'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Users and Access', labelKey: 'menu.users.and.access.label', href: 'users', order: 2, parent: 'Setup', role: 'ROLE_ADMIN',
            children: [{
                href: 'user/create',
                children: []
            }],
            guideSelector: 'sub-menu-user-and-access'
        },
        {
            label: 'My Settings',
            labelKey: 'menu.my.settings.label',
            href: 'settings',
            order: 6,
            parent: 'Setup',
            role: 'ROLE_USER',
            guideSelector: 'sub-menu-my-settings'
        }
    ]
});
