PluginRegistry.add('route', [
    {
        'url': '/sysinfo',
        'module': 'graphdb.framework.stats',
        'path': 'stats/app',
        'chunk': 'stats',
        'controller': 'AdminInfoCtrl',
        'templateUrl': 'pages/info.html',
        'title': 'view.system.information.title',
        'helpInfo': 'view.system.information.helpInfo'
    }, {
        'url': '/webapi',
        'templateUrl': 'pages/webapi.html',
        'title': 'view.rest.api.documentation.title',
        'helpInfo': 'view.rest.api.documentation.helpInfo'
    }
]);

const DOCUMENTATION_URL = 'https://graphdb.ontotext.com/documentation/';

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Setup',
            labelKey: 'menu.setup.label',
            href: '#',
            order: 7,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-settings',
            guideSelector: 'menu-setup'
        }, {
            label: 'Help',
            labelKey: 'menu.help.label',
            href: '#',
            order: 8,
            icon: 'icon-help',
            guideSelector: 'menu-help'
        }, {
            label: 'System information',
            labelKey: 'menu.system.information.label',
            href: 'sysinfo',
            order: 50,
            parent: 'Help',
            role: 'ROLE_ADMIN',
            guideSelector: 'sub-menu-system-information'
        }, {
            label: 'REST API',
            labelKey: 'menu.rest.api.label',
            href: 'webapi',
            order: 1,
            parent: 'Help',
            guideSelector: 'sub-menu-rest-api'
        }, {
            label: 'Documentation',
            labelKey: 'menu.documentation.label',
            order: 2,
            parent: 'Help',
            icon: 'icon-external',
            hrefFun: function (productInfo) {
                return DOCUMENTATION_URL + productInfo.productShortVersion + '/';
            },
            guideSelector: 'sub-menu-documentation'
        }, {
            label: 'Tutorials',
            labelKey: 'menu.tutorials.label',
            order: 3,
            parent: 'Help',
            icon: 'icon-external',
            hrefFun: function (productInfo) {
                return DOCUMENTATION_URL + productInfo.productShortVersion + '/tutorials.html';
            },
            guideSelector: 'sub-menu-developer-hub'
        }, {
            label: 'Support',
            labelKey: 'menu.support.label',
            order: 4,
            parent: 'Help',
            icon: 'icon-external',
            hrefFun: function (productInfo) {
                return DOCUMENTATION_URL + productInfo.productShortVersion + '/support.html';
            },
            guideSelector: 'sub-menu-support'
        }
    ]
});
