import 'angular/core/services';
import 'angular/core/directives';
import 'angular/export/controllers';
import 'angular/export/directives';
import 'angular/repositories/services';
import 'lib/FileSaver-patch';

const modules = [
    'ui.bootstrap',
    'toastr',
    'ngRoute',
    'ngCookies',
    'graphdb.framework.impex.export.controllers',
    'graphdb.framework.impex.export.directives',
    'graphdb.framework.repositories.services',
    'graphdb.framework.core.directives'
];

const exportApp = angular.module('graphdb.framework.impex.export', modules);

exportApp.config(['$menuItemsProvider', '$routeProvider', '$tooltipProvider', function ($menuItemsProvider, $routeProvider, $tooltipProvider) {

    $routeProvider.when('/graphs', {
        templateUrl: 'pages/export.html',
        controller: 'ExportCtrl',
        title: 'Graphs overview',
        helpInfo: 'Graphs overview provides a list of the default graph and all named graphs in GraphDB. '
        + 'It can be used to inspect the statements in each graph, export the graph or clear the graph\'s data. '
    });

    $menuItemsProvider.addItem({
        label: 'Explore',
        href: '#',
        order: 1,
        role: 'IS_AUTHENTICATED_FULLY',
        icon: 'icon-data'
    });

    $menuItemsProvider.addItem({
        label: 'Graphs overview',
        href: 'graphs',
        order: 0,
        role: 'IS_AUTHENTICATED_FULLY',
        parent: 'Explore'
    });

    //Add custom event for Export repository DD tooltip
    $tooltipProvider.setTriggers({'showExportDDTooltip': 'showExportDDTooltip'});

}]);
