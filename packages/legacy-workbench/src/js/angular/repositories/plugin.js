PluginRegistry.add('route', [
    {
        'url': '/repository',
        'module': 'graphdb.framework.repositories',
        'path': 'repositories/app',
        'chunk': 'repositories',
        'controller': 'LocationsAndRepositoriesCtrl',
        'templateUrl': 'pages/repositories.html',
        'title': 'menu.repositories.label',
        'helpInfo': 'view.repositories.helpInfo'
    }, {
        'url': '/repository/create',
        'module': 'graphdb.framework.repositories',
        'path': 'repositories/app',
        'chunk': 'repositories',
        'controller': 'ChooseRepositoryCtrl',
        'templateUrl': 'pages/choose-repository-type.html',
        'title': 'view.choose.repo.title'
    }, {
        'url': '/repository/create/:repositoryType',
        'module': 'graphdb.framework.repositories',
        'path': 'repositories/app',
        'chunk': 'repositories',
        'controller': 'AddRepositoryCtrl',
        'templateUrl': 'pages/repository.html',
        'title': 'Create Repository'
    }, {
        'url': '/repository/edit/:repositoryId',
        'module': 'graphdb.framework.repositories',
        'path': 'repositories/app',
        'chunk': 'repositories',
        'controller': 'EditRepositoryCtrl',
        'templateUrl': 'pages/repository.html',
        'title': 'Edit Repository'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [
        {
            label: 'Setup',
            labelKey: 'menu.setup.label',
            href: '#',
            order: 5,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-settings',
            guideSelector: 'menu-setup'
        },
        {
            label: 'Repositories',
            labelKey: 'menu.repositories.label',
            href: 'repository',
            order: 1,
            role: 'ROLE_REPO_MANAGER',
            parent: 'Setup',
            children: [{
                href: 'repository/create',
                children: []
            }],
            guideSelector: 'sub-menu-repositories'
        }
    ]
});
