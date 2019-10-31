import 'angular/core/services';
import 'angular/core/directives';
import 'angular/clustermanagement/controllers';
import 'angular/clustermanagement/directives';
import 'angular/repositories/services';
import 'd3/build/d3';
import 'lib/d3-ONTO-chord-patch';

const modules = [
    'ngAnimate',
    'toastr',
    'graphdb.framework.clustermanagement.controllers',
    'graphdb.framework.clustermanagement.directives'
];

const clusterManagementApp = angular.module('graphdb.framework.clustermanagement', modules);

clusterManagementApp.config(['$menuItemsProvider', '$routeProvider', function ($menuItemsProvider, $routeProvider) {
    $routeProvider.when('/cluster', {
        templateUrl: 'pages/clusterInfo.html',
        controller: 'ClusterManagementCtrl',
        title: 'Cluster management',
        helpInfo: 'The Cluster management view is a visual administration tool '
        + 'for the GraphDB cluster. Here you can create or modify a cluster '
        + 'by dragging and dropping the nodes or you can use it to monitor '
        + ' the state of a running cluster in near real time. '
        + 'The view shows repositories from the active location and all remote locations.'
    });

    $menuItemsProvider.addItem({label: 'Setup', href: '#', order: 5, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"});
    $menuItemsProvider.addItem({
        label: 'Cluster',
        href: 'cluster',
        order: 20,
        role: 'ROLE_ADMIN',
        parent: 'Setup'
    });

}]);
