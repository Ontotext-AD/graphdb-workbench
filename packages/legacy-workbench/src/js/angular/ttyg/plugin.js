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
            label: 'Lab',
            labelKey: 'menu.lab.label',
            href: '#',
            order: 6,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: "fa-regular fa-flask",
            guideSelector: 'menu-lab'
        },
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
