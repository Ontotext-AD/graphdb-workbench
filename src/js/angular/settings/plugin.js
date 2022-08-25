PluginRegistry.add('route', [
    {
        'url': '/license/register',
        'module': 'graphdb.framework.settings',
        'path': 'settings/app',
        'chunk': 'settings',
        'controller': 'RegisterLicenseCtrl',
        'templateUrl': 'pages/registerLicenseInfo.html',
        'title': 'view.register.license.title',
        'helpInfo': 'view.register.license.helpInfo'
    }, {
        'url': '/license',
        'module': 'graphdb.framework.settings',
        'path': 'settings/app',
        'chunk': 'settings',
        'controller': 'LicenseCtrl',
        'templateUrl': 'pages/licenseInfo.html',
        'title': 'view.existing.license.title',
        'helpInfo': 'view.existing.license.helpInfo'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [{
        label: 'License',
        labelKey: 'menu.license.label',
        href: 'license',
        order: 100,
        role: 'ROLE_ADMIN',
        parent: 'Setup',
        guideSelector: 'sub-menu-license'
    }]
});
