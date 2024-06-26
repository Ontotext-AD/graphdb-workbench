PluginRegistry.add('route', [
    {
        'url': '/chatgpt',
        'templateUrl': 'js/angular/chatgpt/templates/chat.html',
        'module': 'graphdb.framework.chatgpt',
        'path': 'chatgpt/app',
        'controller': 'ChatGptCtrl',
        'title': 'menu.ttyg.label',
        'helpInfo': 'ttyg.helpInfo'
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
            icon: "fa fa-flask",
            guideSelector: 'menu-lab'
        },
        {
            label: 'Talk to Your Graph',
            labelKey: 'menu.ttyg.label',
            href: 'chatgpt',
            order: 20,
            role: 'ROLE_USER',
            parent: 'Lab',
            guideSelector: 'sub-menu-ttyg'
        }]
});
