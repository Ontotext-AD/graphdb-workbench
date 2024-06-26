PluginRegistry.add('route', [
    {
        'url': '/users',
        'module': 'graphdb.framework.security',
        'path': 'security/app',
        'chunk': 'security',
        'controller': 'UsersCtrl',
        'templateUrl': 'js/angular/security/templates/users.html',
        'title': 'menu.users.and.access.label',
        'helpInfo': 'view.users.access.helpInfo',
        'documentationUrl': 'working-with-workbench.html#wbmenu-users-and-access',
        'allowAuthorities': ['READ_REPO_{repoId}']
    }, {
        'url': '/user/create',
        'module': 'graphdb.framework.security',
        'path': 'security/app',
        'chunk': 'security',
        'controller': 'AddUserCtrl',
        'templateUrl': 'js/angular/security/templates/user.html',
        'title': 'Create new user',
        'allowAuthorities': ['READ_REPO_{repoId}']
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
        'title': 'Edit user',
        'allowAuthorities': ['READ_REPO_{repoId}']
    }, {
        'url': '/settings',
        'module': 'graphdb.framework.security',
        'path': 'security/app',
        'chunk': 'security',
        'controller': 'UserSettingsController',
        'templateUrl': 'js/angular/security/templates/user.html',
        'title': 'view.settings.title',
        'documentationUrl': 'customizing-workbench-behavior.html#user-settings'
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
        'title': 'view.roles.mapping.title',
        'allowAuthorities': ['READ_REPO_{repoId}']
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
            label: 'Setup',
            labelKey: 'menu.setup.label',
            href: '#',
            order: 5,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-settings',
            guideSelector: 'menu-setup'
        },
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
