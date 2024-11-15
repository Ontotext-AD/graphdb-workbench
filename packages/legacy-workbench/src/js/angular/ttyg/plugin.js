PluginRegistry.add('route', [
    {
        'url': '/ttyg',
        'templateUrl': 'js/angular/ttyg/templates/ttyg.html',
        'module': 'graphdb.framework.ttyg',
        'path': 'ttyg/app',
        'controller': 'TTYGViewCtrl',
        'title': 'menu.ttyg.label',
        'helpInfo': 'ttyg.helpInfo',
        'documentationUrl': 'talk-to-graph.html',
        'allowAuthorities': ['READ_REPO_{repoId}']
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Talk to Your Graph',
            labelKey: 'menu.ttyg.label',
            href: 'ttyg',
            order: 20,
            role: 'ROLE_USER',
            parent: 'Lab',
            guideSelector: 'sub-menu-ttyg'
        }]
});
