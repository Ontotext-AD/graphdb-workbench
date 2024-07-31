PluginRegistry.add('route', {
    'url': '/aclmanagement',
    'module': 'graphdb.framework.aclmanagement',
    'path': 'aclmanagement/app',
    'chunk': 'aclmanagement',
    'controller': 'AclManagementCtrl',
    'templateUrl': 'pages/aclmanagement.html',
    'title': 'view.aclmanagement.title',
    'helpInfo': 'view.aclmanagement.helpInfo',
    'documentationUrl': 'managing-fgac-workbench.html'
});

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'ACL Management',
            labelKey: 'menu.aclmanagement.label',
            href: 'aclmanagement',
            order: 6,
            parent: 'Setup',
            role: "ROLE_ADMIN",
            guideSelector: 'sub-menu-aclmanagement'
        }
    ]
});
