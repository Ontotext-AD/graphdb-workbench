PluginRegistry.add('route', [
    {
        'url': '/sysinfo',
        'module': 'graphdb.framework.stats',
        'path': 'stats/app',
        'chunk': 'stats',
        'controller': 'AdminInfoCtrl',
        'templateUrl': 'pages/info.html',
        'title': 'view.system.information.title',
        'helpInfo': 'view.system.information.helpInfo',
        'documentationUrl': 'diagnosing-and-reporting-critical-errors.html#running-a-system-report',
        'allowAuthorities': ['READ_REPO_{repoId}'],
    },
]);

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Help',
            labelKey: 'menu.help.label',
            href: '#',
            order: 8,
            icon: 'icon-help',
            guideSelector: 'menu-help',
            testSelector: 'menu-help',
            children: [],
        }, {
            label: 'System information',
            labelKey: 'menu.system.information.label',
            href: 'sysinfo',
            order: 50,
            parent: 'Help',
            role: 'ROLE_ADMIN',
            guideSelector: 'sub-menu-system-information',
            testSelector: 'sub-menu-system-information',
        }, {
            label: 'Documentation',
            labelKey: 'menu.documentation.label',
            order: 2,
            parent: 'Help',
            icon: 'icon-external',
            documentationHref: 'index.html',
            hrefFun: function(productInfo, urlResolver) {
                return urlResolver(productInfo.productShortVersion, 'index.html');
            },
            guideSelector: 'sub-menu-documentation',
        }, {
            label: 'Tutorials',
            labelKey: 'menu.tutorials.label',
            order: 3,
            parent: 'Help',
            icon: 'icon-external',
            documentationHref: 'tutorials.html',
            hrefFun: function(productInfo, urlResolver) {
                return urlResolver(productInfo.productShortVersion, 'tutorials.html');
            },
            guideSelector: 'sub-menu-developer-hub',
        }, {
            label: 'Support',
            labelKey: 'menu.support.label',
            order: 4,
            parent: 'Help',
            icon: 'icon-external',
            documentationHref: 'support.html',
            hrefFun: function(productInfo, urlResolver) {
                return urlResolver(productInfo.productShortVersion, 'support.html');
            },
            guideSelector: 'sub-menu-support',
        },
    ],
});
