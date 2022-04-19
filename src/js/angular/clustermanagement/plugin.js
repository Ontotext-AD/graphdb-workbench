PluginRegistry.add('route', [
    {
        'url': '/cluster',
        'module': 'graphdb.framework.clustermanagement',
        'chunk': 'clustermanagement',
        'path': 'clustermanagement/app',
        'controller': 'ClusterManagementCtrl',
        'templateUrl': 'pages/cluster-management/clusterInfo.html',
        'helpInfo': 'view.clusterManagement.helpInfo',
        'title': 'view.clusterManagement.title'
    }, {
        'url': '/cluster/create',
        'module': 'graphdb.framework.clustermanagement',
        'path': 'clustermanagement/app',
        'chunk': 'clustermanagement',
        'controller': 'CreateClusterCtrl',
        'templateUrl': 'pages/cluster-management/cluster-configuration.html',
        'title': 'view.clusterManagement.create.title'
    }
]);

PluginRegistry.add('main.menu', {
    'items': [{
        label: 'Cluster',
        labelKey: 'menu.cluster.label',
        href: 'cluster',
        order: 20,
        role: 'ROLE_ADMIN',
        parent: 'Setup',
        children: [{
            href: 'cluster/create',
            children: []
        }]
    }]
});

