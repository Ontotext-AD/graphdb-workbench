import 'angular/core/services';
import 'angular/controllers';
import 'angular/core/angularCancelOnNavigateModule';
import 'oclazyload';
import 'angular/core/interceptors/unauthorized.interceptor';
import 'angular/core/directives/rdfresourcesearch/rdf-resource-search.directive';

const modules = [
    'ngRoute',
    'graphdb.workbench.se.controllers',
    'graphdb.framework.core',
    'angularCancelOnNavigateModule',
    'oc.lazyLoad',
    'graphdb.framework.core.interceptors.unauthorized',
    'graphdb.framework.core.directives.rdfresourcesearch.rdfresourcesearch'
];

const moduleDefinition = function (productInfo) {
    const workbench = angular.module('graphdb.workbench', modules);

    workbench.config(['$routeProvider', '$locationProvider', '$menuItemsProvider', 'toastrConfig', 'localStorageServiceProvider', '$uibTooltipProvider', '$httpProvider', '$templateRequestProvider',
        function ($routeProvider, $locationProvider, $menuItemsProvider, toastrConfig, localStorageServiceProvider, $uibTooltipProvider, $httpProvider, $templateRequestProvider) {

            angular.extend(toastrConfig, {
                timeOut: 5000,
                positionClass: 'toast-bottom-right'
            });


            localStorageServiceProvider
                .setStorageType('localStorage')
                .setNotify(true, true);


            var $route = $routeProvider.$get[$routeProvider.$get.length-1]({$on:function(){}});

            // Handle OAuth returned url, _openid_implicit_ is just a placeholder, the actual URL
            // is defined by the regular expression below.
            $routeProvider.when('_openid_implicit_',{
                controller : function() {
                },
                template : "<div></div>"
            });

            // The URL will contain access_token=xxx and id_token=xxx and possibly other parameters,
            // separated by &. Parameters may come in any order.
            $route.routes['_openid_implicit_'].regexp = /[&/](?:id_token=.*&access_token=|access_token=.*&id_token=)/;

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
            $uibTooltipProvider.setTriggers({'show': 'hide'});
            $uibTooltipProvider.options({appendToBody: true});

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

            $httpProvider.interceptors.push('$unauthorizedInterceptor');

            // Hack the template request provider to add a version parameter to templates that
            // are fetched via HTTP to avoid cache issues. Those that are in the templateCache
            // already aren't actually fetched via HTTP so we don't want to add the parameter there.
            const originalTemplateProviderFn = $templateRequestProvider.$get[3];
            if (typeof originalTemplateProviderFn === 'function') {
                $templateRequestProvider.$get[3] = function (templateCache, http, q) {
                    const originalHandleRequestFn = originalTemplateProviderFn(templateCache, http, q);
                    return function handleRequestFn(tpl, ignoreRequestError) {
                        if (!templateCache.get(tpl)) {
                            // The AIV tag will be replaced by the actual version by the
                            // webpack-auto-inject-version plugin, e.g. it will become v=1.5.0
                            tpl = tpl + '?v=[AIV]{version}[/AIV]';
                        }
                        return originalHandleRequestFn(tpl, ignoreRequestError);
                    }
                };
            }
        }]);

    workbench.constant('isEnterprise', productInfo.productType === 'enterprise');
    workbench.constant('isFreeEdition', productInfo.productType === 'free');
    workbench.constant('productInfo', productInfo);

    // we need to inject $jwtAuth here in order to init the service before everything else
    workbench.run(['$rootScope', '$route', 'toastr', '$sce', function ($rootScope, $route, toastr, $sce) {
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
