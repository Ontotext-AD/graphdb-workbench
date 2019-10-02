import 'angular/core/services';
import 'angular/repositories/app';
import 'angular/export/app';
import 'angular/import/app';
import 'angular/security/app';
import 'angular/sparql/app';
import 'angular/graphexplore/app';
import 'angular/namespaces/app';
import 'angular/explore/app';
import 'angular/stats/app';
import 'angular/resources/app';
import 'angular/queries/app';
import 'angular/externalsync/app';
import 'angular/controllers';
import 'angular/autocomplete/app';
import 'angular/ontorefine/app';
import 'angular/rdfrank/app';
import 'angular/similarity/app';
import 'angular/angularCancelOnNavigateModule';

const modules = [
    'ngRoute',
    'graphdb.workbench.se.controllers',
    'graphdb.framework.core',
    'graphdb.framework.repositories',
    'graphdb.framework.impex.export',
    'graphdb.framework.impex.import',
    'graphdb.framework.security',
    'graphdb.framework.explore',
    'graphdb.framework.sparql',
    'graphdb.framework.graphexplore',
    'graphdb.framework.namespaces',
    'graphdb.framework.stats',
    'graphdb.framework.jmx.resources',
    'graphdb.framework.jmx.queries',
    'graphdb.framework.externalsync',
    'graphdb.framework.autocomplete',
    'graphdb.framework.ontorefine',
    'graphdb.framework.rdfrank',
    'graphdb.framework.similarity',
    'angularCancelOnNavigateModule'
];

const moduleDefinition = function (productInfo) {
    const workbench = angular.module('graphdb.workbench', modules);

    workbench.config(['$routeProvider', '$locationProvider', '$menuItemsProvider', 'toastrConfig', 'localStorageServiceProvider', '$tooltipProvider',
        function ($routeProvider, $locationProvider, $menuItemsProvider, toastrConfig, localStorageServiceProvider, $tooltipProvider) {

            angular.extend(toastrConfig, {
                timeOut: 5000,
                positionClass: 'toast-bottom-right'
            });

            localStorageServiceProvider
                .setStorageType('localStorage')
                .setNotify(true, true);

            $routeProvider.when('/', {
                templateUrl: 'pages/home.html',
                controller: 'homeCtrl'
            }).otherwise({
                templateUrl: 'pages/not_found.html'
            });

            // use the HTML5 History API
            $locationProvider.html5Mode(true);

            // Extra triggers for tooltip/popover so we can do fancier stuff (see core-errors for example)
            $tooltipProvider.setTriggers({'show': 'hide'});

            // Due to angular weirdness and what gets injected where we can't inject the productInfo constant
            // at the time of module creation so we pass it to $menuItemsProvider. The info can be used
            // to construct version/edition-specific links.
            $menuItemsProvider.setProductInfo(productInfo);
        }]);

    workbench.constant('isEnterprise', productInfo.productType === 'enterprise');
    workbench.constant('isFreeEdition', productInfo.productType === 'free');
    workbench.constant('productInfo', productInfo);

    // we need to inject $jwtAuth here in order to init the service before everything else
    workbench.run(['$cookies', '$rootScope', '$route', 'toastr', function ($cookies, $rootScope, $route, toastr) {
        $rootScope.$on('$routeChangeSuccess', function () {
            if ($route.current.title) {
                document.title = $route.current.title + ' | GraphDB Workbench';
            } else {
                document.title = 'GraphDB Workbench';
            }
            $rootScope.helpInfo = $route.current.helpInfo;
            $rootScope.title = $route.current.title;

            toastr.clear();
        });
    }]);

    angular.bootstrap(document, ['graphdb.workbench']);
};

$.get('rest/info/version?local=1', function (data) {
    const versionArray = data.productVersion.match(/^(\d+\.\d+)/);
    if (versionArray.length) {
        data.productShortVersion = versionArray[1];
    } else {
        data.productShortVersion = data.productVersion;
    }

    // TODO: TEST
    if (data.productType === 'enterprise') {
        modules.push('graphdb.framework.clustermanagement');
        require(['angular/clustermanagement/app'], function () {
            moduleDefinition(data);
        });
    } else {
        moduleDefinition(data);
    }
});
