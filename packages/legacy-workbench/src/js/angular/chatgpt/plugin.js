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
            label: 'Talk to Your Graph',
            labelKey: 'menu.ttyg.label',
            href: 'chatgpt',
            order: 20,
            role: 'ROLE_USER',
            parent: 'Lab',
            guideSelector: 'sub-menu-ttyg'
        }]
});
