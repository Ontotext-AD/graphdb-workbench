PluginRegistry.add('route', [
    {
        'url': '/sysinfo',
        'module': 'graphdb.framework.stats',
        'path': 'stats/app',
        'chunk': 'stats',
        'controller': 'AdminInfoCtrl',
        'templateUrl': 'pages/info.html',
        'title': 'System information',
        'helpInfo': 'The System information view shows the configuration values of the JVM '
        + 'running the GraphDB Workbench as well generate a detailed server report file you can use to hunt down issues'
    }, {
        'url': '/webapi',
        'templateUrl': 'pages/webapi.html',
        'title': 'REST API documentation',
        'helpInfo': 'The REST API view documents the available public RESTful endpoints and '
        + 'provides an interactive interface to execute the requests.'
    }
]);

const DOCUMENTATION_URL = 'https://graphdb.ontotext.com/documentation/';

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Setup',
            href: '#',
            order: 7,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-settings'
        }, {
            label: 'Help',
            href: '#',
            order: 8,
            icon: 'icon-help'
        }, {
            label: 'System information',
            href: 'sysinfo',
            order: 50,
            parent: 'Help',
            role: 'ROLE_ADMIN'
        }, {
            label: 'REST API',
            href: 'webapi',
            order: 1,
            parent: 'Help'
        }, {
            label: 'Documentation',
            order: 2,
            parent: 'Help',
            icon: 'icon-external',
            hrefFun: function (productInfo) {
                if (productInfo.productType) {
                    return DOCUMENTATION_URL + productInfo.productShortVersion + '/' + productInfo.productType + '/';
                }
                return DOCUMENTATION_URL;
            }
        }, {
            label: 'Developer Hub',
            order: 3,
            parent: 'Help',
            icon: 'icon-external',
            hrefFun: function (productInfo) {
                if (productInfo.productType) {
                    return DOCUMENTATION_URL + productInfo.productShortVersion + '/' + productInfo.productType + '/devhub/';
                }
                return DOCUMENTATION_URL + 'free/devhub/';
            }
        }, {
            label: 'Support',
            order: 4,
            parent: 'Help',
            icon: 'icon-external',
            hrefFun: function (productInfo) {
                if (productInfo.productType) {
                    return DOCUMENTATION_URL + productInfo.productShortVersion + '/' + productInfo.productType + '/support.html';
                }
                return DOCUMENTATION_URL + 'free/support.html';
            }
        }
    ]
});
