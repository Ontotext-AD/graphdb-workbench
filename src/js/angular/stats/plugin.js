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
