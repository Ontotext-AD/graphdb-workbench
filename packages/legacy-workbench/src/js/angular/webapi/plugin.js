PluginRegistry.add('route', [
  {
    'url': '/webapi',
    'module': 'graphdb.framework.help.webapi',
    'path': 'webapi/app',
    'controller': 'WebapiCtrl',
    'templateUrl': 'pages/webapi.html',
    'title': 'view.rest.api.documentation.title',
    'helpInfo': 'view.rest.api.documentation.helpInfo',
    'documentationUrl': 'using-the-graphdb-rest-api.html',
  },
]);

PluginRegistry.add('main.menu', {
  'items': [
    {
      label: 'REST API',
      labelKey: 'menu.rest.api.label',
      href: 'webapi',
      order: 1,
      parent: 'Help',
      guideSelector: 'sub-menu-rest-api',
      testSelector: 'sub-menu-rest-api',
      role: 'ROLE_USER',
    },
  ],
});
