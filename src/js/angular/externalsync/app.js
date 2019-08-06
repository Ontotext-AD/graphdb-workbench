import 'angular/core/services';
import 'angular/core/directives';
import 'angular/core/controllers';
import 'angular/externalsync/controllers';
import 'angular/externalsync/directives';

const modules = [
    'graphdb.framework.core.controllers',
    'graphdb.framework.externalsync.controllers',
    'graphdb.framework.externalsync.directives',
    'graphdb.framework.core.directives'
];

const connectors = angular.module('graphdb.framework.externalsync', modules);

connectors.config(['$routeProvider', '$menuItemsProvider', function ($routeProvider, $menuItemsProvider) {

    $routeProvider.when('/connectors', {
        templateUrl: 'pages/connectorsInfo.html',
        controller: 'ConnectorsCtrl',
        title: 'Connector management',
        helpInfo: 'The Connector management view is used to create and manage GraphDB connector instances.'
    });

    $menuItemsProvider.addItem({label: 'Setup', href: '#', order: 5, role: "IS_AUTHENTICATED_FULLY", icon: "icon-settings"});
    $menuItemsProvider.addItem({label: 'Connectors', href: 'connectors', order: 10, parent: 'Setup', role: 'IS_AUTHENTICATED_FULLY'});
}]);

connectors.filter('singular', function () {
    return function (noun) {
        if (angular.isUndefined(noun)) {
            return noun;
        }
        else {
            return noun.replace(/ies$/, 'y').replace(/s$/, '');
        }
    }
});
