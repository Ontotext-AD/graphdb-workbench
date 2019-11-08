import 'angular/core/services';
import 'angular/controllers';
import 'angular/core/angularCancelOnNavigateModule';
import 'oclazyload';

const modules = [
    'ngRoute',
    'graphdb.workbench.se.controllers',
    'graphdb.framework.core',
    'angularCancelOnNavigateModule',
    'oc.lazyLoad'
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

            let routes = PluginRegistry.get('route');

            routes.forEach(function (route) {
                $routeProvider.when(route.url, {
                    controller: route.controller,
                    templateUrl: route.templateUrl,
                    title: route.title,
                    helpInfo: route.helpInfo,
                    reloadOnSearch: route.reloadOnSearch !== undefined ? route.reloadOnSearch : true,
                    resolve: {
                        preload: ['$ocLazyLoad', '$q', function ($ocLazyLoad, $q) {
                            // some modules define routes to just static pages
                            if (!route.path) {
                                return $q.defer().resolve();
                            }
                            return import(`angular/${route.path}`).then(module => {
                                $ocLazyLoad.inject(route.module);
                            })
                        }]
                    }
                });
            });

            $routeProvider.otherwise({
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

            let mainMenu = PluginRegistry.get('main.menu');
            mainMenu.forEach(function (menu) {
                menu.items.forEach(function (item) {
                    $menuItemsProvider.addItem(item);
                });
            });
        }]);

    workbench.constant('isEnterprise', productInfo.productType === 'enterprise');
    workbench.constant('isFreeEdition', productInfo.productType === 'free');
    workbench.constant('productInfo', productInfo);

    // we need to inject $jwtAuth here in order to init the service before everything else
    workbench.run(['$cookies', '$rootScope', '$route', 'toastr', '$sce', function ($cookies, $rootScope, $route, toastr, $sce) {
        $rootScope.$on('$routeChangeSuccess', function () {
            if ($route.current.title) {
                document.title = $route.current.title + ' | GraphDB Workbench';
            } else {
                document.title = 'GraphDB Workbench';
            }
            $rootScope.helpInfo = $sce.trustAsHtml($route.current.helpInfo);
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
