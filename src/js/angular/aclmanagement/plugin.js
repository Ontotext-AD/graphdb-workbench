PluginRegistry.add('route', {
    'url': '/aclmanagement',
    'module': 'graphdb.framework.aclmanagement',
    'path': 'aclmanagement/app',
    'chunk': 'aclmanagement',
    'controller': 'AclManagementCtrl',
    'templateUrl': 'pages/aclmanagement.html',
    'title': 'view.aclmanagement.title',
    'helpInfo': 'view.aclmanagement.helpInfo'
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
            labelKey: 'menu.aclmanagement.label',
            href: 'aclmanagement',
            order: 6,
            parent: 'Setup',
            role: "IS_AUTHENTICATED_FULLY",
            guideSelector: 'sub-menu-aclmanagement'
        }
    ]
});
