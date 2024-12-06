PluginRegistry.add('route', {
    'url': '/',
    'module': 'graphdb.workbench',
    'chunk': 'home',
    'path': 'controllers',
    'controller': 'homeCtrl',
    'templateUrl': 'pages/home.html'
});

PluginRegistry.add('main.menu', {
        items: [
            {
                label: 'Setup',
                labelKey: 'menu.setup.label',
                href: '#',
                order: 5,
                role: 'IS_AUTHENTICATED_FULLY',
                icon: "icon-settings",
                guideSelector: 'menu-setup',
                children: []
            },
            {
                label: 'Monitor',
                labelKey: 'menu.monitor.label',
                href: '#',
                order: 3,
                // Changed to role user as now users can monitor their own queries
                role: 'ROLE_USER',
                icon: 'icon-monitoring',
                guideSelector: 'menu-monitor',
                children: []
            },
            {
                label: 'Lab',
                labelKey: 'menu.lab.label',
                href: '#',
                order: 6,
                role: 'IS_AUTHENTICATED_FULLY',
                icon: "fa fa-flask",
                guideSelector: 'menu-lab',
                children: []
            },
            {
                label: 'Graphql',
                labelKey: 'menu.graphql',
                href: 'graphql',
                order: 1001,
                role: 'IS_AUTHENTICATED_FULLY',
                icon: "fa fa-flask",
                guideSelector: 'menu-lab',
                children: []
            }
        ]
    }
);
