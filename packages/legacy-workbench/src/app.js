import singleSpaAngularJS from "./single-spa-angularjs";
import './vendor';
import './main';

import angular from "angular";
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
import 'angular/core/directives/page-info-tooltip.directive';
import 'angular/core/filters/search-filter';
import 'angular/core/filters/bytes-filter';
import 'angular/core/services/language.service'
import {defineCustomElements as defineYasguiElements} from 'ontotext-yasgui-web-component/loader';
import {defineCustomElements as defineGraphQlElements} from 'ontotext-graphql-playground-component/loader';
import {convertToHumanReadable} from "./js/angular/utils/size-util";
import {DocumentationUrlResolver} from "./js/angular/utils/documentation-url-resolver";
import {NumberUtils} from "./js/angular/utils/number-utils";
import {HtmlUtil} from "./js/angular/utils/html-util";
import {ServiceProvider, LanguageContextService} from "@ontotext/workbench-api";

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
    'graphdb.framework.core.directives.page-info-tooltip',
    'graphdb.framework.guides.services',
    'graphdb.framework.core.directives.operationsstatusesmonitor',
    'graphdb.framework.core.directives.autocomplete',
    'ngCustomElement',
    'graphdb.framework.core.services.language-service',
    'graphdb.framework.core.filters.searchFilter',
    'graphdb.framework.core.filters.bytes'
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
    '$translateProvider',
    '$languageServiceProvider'
];

const workbench = angular.module('graphdb.workbench', modules);

const moduleDefinition = function (productInfo, translations) {
    defineYasguiElements();
    defineGraphQlElements();

    workbench.config([...providers,
        function ($routeProvider, $locationProvider, $menuItemsProvider, toastrConfig, localStorageServiceProvider,
                  $uibTooltipProvider, $httpProvider, $templateRequestProvider, $translateProvider, $languageServiceProvider) {

            if (translations && Object.keys(translations).length > 0) {
                // If translations data is provided, iterate over the object and register each language key
                // and its corresponding translation data with $translateProvider.
                Object.keys(translations).forEach(langKey => {
                    $translateProvider.translations(langKey, translations[langKey]);
                });
                $translateProvider.preferredLanguage($languageServiceProvider.getDefaultLanguage());
            } else {
                // If no translation data is preloaded, fallback to loading translation files dynamically
                // using the static files' loader.
                // This tells $translateProvider to load translations from external files based on
                // the specified pattern (prefix/suffix).
                $translateProvider.useStaticFilesLoader({
                    prefix: 'i18n/locale-',
                    suffix: '.json?v=[AIV]{version}[/AIV]'
                });
                // load 'en' table on startup
                $translateProvider.preferredLanguage($languageServiceProvider.getDefaultLanguage());
            }
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

            const $route = $routeProvider.$get[$routeProvider.$get.length - 1]({
                $on: function () {
                }
            });

            // Handle OAuth returned url, _openid_implicit_ is just a placeholder, the actual URL
            // is defined by the regular expression below.
            $routeProvider.when('_openid_implicit_', {
                controller: function () {
                },
                template: "<div></div>"
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
                    documentationUrl: route.documentationUrl,
                    allowAuthorities: route.allowAuthorities,
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

            // TODO: [MIG] remove this when cleaning the code. The main menu is processed in shared-components.
            // let mainMenu = PluginRegistry.get('main.menu');
            // mainMenu.forEach(function (menu) {
            //     menu.items.forEach(function (item) {
            //         $menuItemsProvider.addItem(item);
            //     });
            // });

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
            const routeChangeUnsubscribe = $rootScope.$on('$routeChangeSuccess', function () {
                updateTitleAndHelpInfo();

                toastr.clear();
            });

            const translateChangeUnsubscribe = $rootScope.$on('$translateChangeSuccess', function () {
                updateTitleAndHelpInfo();
            });

            function updateTitleAndHelpInfo() {
                // In the new implementation of the language service, the event is triggered too early,
                // before the route is ready. Therefore, we need to check if the route is ready before translate the title.
                if(!$route.current) {
                    return;
                }
                if ($route.current.title) {
                    document.title = decodeHTML($translate.instant($route.current.title)) + ' | GraphDB Workbench';
                } else {
                    document.title = 'GraphDB Workbench';
                }

                $rootScope.helpInfo = $route.current.helpInfo && $sce.trustAsHtml(decodeHTML($translate.instant($route.current.helpInfo)));
                $rootScope.title = decodeHTML($translate.instant($route.current.title));
                $rootScope.documentationUrl =  DocumentationUrlResolver.getDocumentationUrl(productInfo.productShortVersion, $route.current.documentationUrl);
            }

            // Check if theme is set in local storage workbench settings and apply
            const currentTheme = WorkbenchSettingsStorageService.getThemeName();
            ThemeService.applyTheme(currentTheme);
            ThemeService.applyDarkThemeMode();

            GuidesService.init();

            // =========================
            // Functions and configurations for integration with the shared-components module.
            // =========================
            const languageContextService = ServiceProvider.get(LanguageContextService);

            const languageChangeSubscriptions = languageContextService
                .onSelectedLanguageChanged((language) => {$translate.use(language)});

            $rootScope.$on('$destroy', () => {
                if (languageChangeSubscriptions) {
                    languageChangeSubscriptions();
                }
                routeChangeUnsubscribe();
                translateChangeUnsubscribe();
                // Remove all routes so that when navigating from legacy-workbench to the new workbench and back, the
                // router will not try to load the route before the app is bootstrapped again.
                Object.keys($route.routes).forEach(function(route) {
                    delete $route.routes[route];
                });
            })
        }]);

    workbench.filter('titlecase', function () {
        return function (input) {
            const s = "" + input;
            return s.charAt(0).toUpperCase() + s.slice(1);
        };
    });

    workbench.filter('prettyJSON', () => (json) => angular.toJson(json, true));
    workbench.filter('humanReadableSize', () => (size) => convertToHumanReadable(size));
    workbench.filter('trustAsHtml', ['$translate', '$sce', ($translate, $sce) => (message) => $sce.trustAsHtml(decodeHTML(message))]);
    workbench.filter('formatNumberToLocaleString', ['$translate', ($translate) => (number) => NumberUtils.formatNumberToLocaleString(number, $translate.use())]);
    workbench.filter('htmlAsText', () => (html) => HtmlUtil.getText(html));
};

const wbInit = () => {
    const workbenchElement = document.getElementById('workbench-app');
    return angular.bootstrap(workbenchElement, ['graphdb.workbench']);
};

// Manually load language files
function initTranslations() {
    const languages = __LANGUAGES__.availableLanguages.map(lang => lang.key)
    const promises = languages.map(loadTranslations);
    const translations = {};
    return Promise.all(promises)
        .then((results) => {
            results.forEach(result => {
                if (result) {
                    translations[result.language] = result.data;
                }
            });
            // Start the app once all translations are loaded
            return translations;
        })
        .catch(() => {
            console.error('Failed to load one or more translation files.');
            return translations;
        });
}

// Helper function to load translations for a given language
function loadTranslations(language) {
    return $.getJSON(`i18n/locale-${language}.json?v=[AIV]{version}[/AIV]`)
        .then(function (data) {
            return {language, data};
        })
        .fail(function () {
            console.error(`Failed to load translation file for: ${language}`);
            return null;
        });
}

// Fetch the product version information before bootstrapping the app
function loadAppInfo() {
    return new Promise((resolve, reject) => {
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
            return resolve(data);
        });
    });
}

function startWorkbench() {
    let translations;
    return initTranslations()
        .then((translationData) => {
            translations = translationData;
            return loadAppInfo();
        })
        .then((appInfo) => {
            moduleDefinition(appInfo, translations);
            return wbInit();
        })
        .catch((error) => {
            console.error('Failed to start the workbench.', error);
        });
}

const ngLifecycles = singleSpaAngularJS({
    angular: angular,
    domElementGetter: () => {
        return document.getElementById('single-spa-application:@ontotext/legacy-workbench');
    },
    mainAngularModule: "graphdb.workbench",
    ngRoute: true,
    preserveGlobal: false,
    elementId: 'workbench-app',
    template: `
        <div ng-controller="mainCtrl">
            <div class="main-container">
                <div ng-view></div>
            </div>
        </div>
    `
});

export const bootstrap = (props) => {
    // The usage of the generated bootstrap is commented out because it triggers the initialization of angular
    // In the workbench case, we configure the workbench and bootstrap it in the app.js file.
    return ngLifecycles.bootstrap(props);
};

export const mount = (props) => {
    return Promise.resolve()
        .then(() => {
            props.initApplication = () => {
                return startWorkbench();
            }
            return ngLifecycles.mount(props);
        });
};

export const unmount = (props) => {
    return ngLifecycles.unmount(props);
};
