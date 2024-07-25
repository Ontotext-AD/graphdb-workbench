import 'angular/core/services';
import 'angular/controllers';
import 'angular/core/angularCancelOnNavigateModule';
import 'oclazyload';
import 'angular-translate';
import 'angular-translate-loader-static-files';
import 'angular/core/interceptors/unauthorized.interceptor';
import 'angular/core/interceptors/authentication.interceptor';
import 'angular/core/directives/rdfresourcesearch/rdf-resource-search.directive';
import 'angular/core/directives/languageselector/language-selector.directive';
import 'angular/core/directives/copy-to-clipboard/copy-to-clipboard.directive';
import 'angular/core/directives/angulartooltips/angular-tooltips.js';
import 'angular/core/directives/uppercased.directive';
import 'angular/core/directives/operations-statuses-monitor/operations-statuses-monitor.directive';
import 'angular/core/directives/autocomplete/autocomplete.directive';
import 'angular/core/directives/prop-indeterminate/prop-indeterminate.directive';
import {defineCustomElements} from 'ontotext-yasgui-web-component/loader';
import {WorkbenchServiceProvider, WorkbenchGlobalContextService} from "@ontotext/workbench-api";

// $translate.instant converts <b> from strings to &lt;b&gt
// and $sce.trustAsHtml could not recognise that this is valid html
export const decodeHTML = function (html) {
    let txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
};

const modules = [
    'ngRoute',
    'graphdb.workbench.se.controllers',
    'graphdb.framework.core',
    'angularCancelOnNavigateModule',
    'oc.lazyLoad',
    'pascalprecht.translate',
    'graphdb.framework.core.interceptors.unauthorized',
    'graphdb.framework.core.interceptors.authentication',
    'graphdb.framework.core.directives.rdfresourcesearch.rdfresourcesearch',
    'graphdb.framework.core.directives.languageselector.languageselector',
    'graphdb.framework.core.directives.copytoclipboard.copytoclipboard',
    'graphdb.framework.core.directives.angular-tooltips',
    'graphdb.framework.core.directives.uppercased',
    'graphdb.framework.core.directives.prop-indeterminate',
    'graphdb.framework.guides.services',
    'graphdb.framework.core.directives.operationsstatusesmonitor',
    'graphdb.framework.core.directives.autocomplete',
    'ngCustomElement'
];

const providers = [
    '$routeProvider',
    '$locationProvider',
    '$menuItemsProvider',
    'toastrConfig',
    'localStorageServiceProvider',
    '$uibTooltipProvider',
    '$httpProvider',
    '$templateRequestProvider',
    '$translateProvider'
];

const workbench = angular.module('graphdb.workbench', modules);

const moduleDefinition = function (productInfo) {

    defineCustomElements();

    workbench.config([...providers,
        function ($routeProvider,
                  $locationProvider,
                  $menuItemsProvider,
                  toastrConfig,
                  localStorageServiceProvider,
                  $uibTooltipProvider,
                  $httpProvider,
                  $templateRequestProvider,
                  $translateProvider) {

            // configure angular translate module
            // configures staticFilesLoader
            $translateProvider.useStaticFilesLoader({
                prefix: 'i18n/locale-',
                suffix: '.json?v=[AIV]{version}[/AIV]'
            });
            // load 'en' table on startup
            $translateProvider.preferredLanguage('en');
            $translateProvider.useSanitizeValueStrategy('escape');

            // configure toastr
            angular.extend(toastrConfig, {
                timeOut: 5000,
                positionClass: 'toast-bottom-right',
                tapToDismiss: false,
                extendedTimeOut: 5000
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

            angular.forEach(routes, function (route) {
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
                                $ocLazyLoad.inject(route.module)
                                    .catch(err => {
                                        console.log(err)
                                    });
                            }).catch(error => {
                                console.error(`Error loading module for path: ${route.path}`, error);
                                return $q.reject(error);
                            });
                        }]
                    }
                });
            });

            // $routeProvider.otherwise({
            //     templateUrl: 'pages/not_found.html'
            // });

            // use the HTML5 History API
            $locationProvider.html5Mode(true);

            // Extra triggers for tooltip/popover so we can do fancier stuff (see core-errors for example)
            $uibTooltipProvider.setTriggers({'show': 'hide'});
            $uibTooltipProvider.options({appendToBody: true});

            // Due to angular weirdness and what gets injected where we can't inject the productInfo constant
            // at the time of module creation so we pass it to $menuItemsProvider. The info can be used
            // to construct version/edition-specific links.
            $menuItemsProvider.setProductInfo(productInfo);

            // TODO this remove this when clean code. The main menu is processed in shared-components
            let mainMenu = PluginRegistry.get('main.menu');
            mainMenu.forEach(function (menu) {
                menu.items.forEach(function (item) {
                    $menuItemsProvider.addItem(item);
                });
            });

            $httpProvider.interceptors.push('$unauthorizedInterceptor');
            $httpProvider.interceptors.push('$authenticationInterceptor');

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

    workbench.constant('productInfo', productInfo);

    // we need to inject $jwtAuth here in order to init the service before everything else
    workbench.run(['$rootScope', '$route', 'toastr', '$sce', '$translate', 'ThemeService', 'WorkbenchSettingsStorageService', 'LSKeys', 'GuidesService',
        function ($rootScope, $route, toastr, $sce, $translate, ThemeService, WorkbenchSettingsStorageService, LSKeys, GuidesService) {
        $rootScope.$on('$routeChangeSuccess', function () {
            updateTitleAndHelpInfo();

            toastr.clear();
        });

        $rootScope.$on('$translateChangeSuccess', function () {
            updateTitleAndHelpInfo();
        });

        function updateTitleAndHelpInfo() {
            if ($route.current.title) {
                document.title = decodeHTML($translate.instant($route.current.title)) + ' | GraphDB Workbench';
            } else {
                document.title = 'GraphDB Workbench';
            }

            $rootScope.helpInfo = $sce.trustAsHtml(decodeHTML($translate.instant($route.current.helpInfo)));
            $rootScope.title = decodeHTML($translate.instant($route.current.title));
        }

        // Check if theme is set in local storage workbench settings and apply
        const currentTheme = WorkbenchSettingsStorageService.getThemeName();
        ThemeService.applyTheme(currentTheme);
        ThemeService.applyDarkThemeMode();

        GuidesService.init();

        // =========================
        // Functions and configurations for integration with the shared-components module.
        // =========================
        let globalContextService = WorkbenchServiceProvider.get(WorkbenchGlobalContextService);

        let languageChangeSubscriptions = globalContextService.onLanguageChanged()
            .subscribe((language) => {
            $translate.use(language);
        });

        $rootScope.$on('destroy', () => {
            console.log("Destroy")
            languageChangeSubscriptions.unsubscribe();
        })
    }]);

    workbench.filter('titlecase', function() {
        return function (input) {
            var s = "" + input;
            return s.charAt(0).toUpperCase() + s.slice(1);
        };
    });

    workbench.filter('prettyJSON', () => (json) => angular.toJson(json, true));

    const workbenchElement = document.getElementById('workbench-app');
    angular.bootstrap(workbenchElement, ['graphdb.workbench']);
};

$.get('/rest/info/version?local=1', function (data) {
    // Extract major.minor version as short version
    const versionArray = data.productVersion.match(/^(\d+\.\d+)/);
    if (versionArray.length) {
        data.productShortVersion = versionArray[1];
    } else {
        data.productShortVersion = data.productVersion;
    }

    // Add the first attribute to the short version, e.g. if the full version is 10.0.0-M3-RC1,
    // the first attribute is M3 so the short version will be 10.0-M3.
    const attributeArray = data.productVersion.match(/(-.*?)(-|$)/);
    if (attributeArray && attributeArray.length) {
        data.productShortVersion = data.productShortVersion + attributeArray[1];
    }

    moduleDefinition(data);
});
