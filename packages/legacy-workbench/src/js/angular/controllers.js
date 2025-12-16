import 'angular/core/services';
import 'angular/rest/sparql.rest.service';
import 'angular/rest/autocomplete.rest.service';
import 'angular/rest/plugins.rest.service';
import 'angular/rest/monitoring.rest.service';
import 'angular/rest/repositories.rest.service';
import 'ng-file-upload/dist/ng-file-upload.min';
import 'ng-file-upload/dist/ng-file-upload-shim.min';
import 'angular/core/services/jwt-auth.service';
import 'angular/core/services/repositories.service';
import 'angular/core/services/tracking/tracking.service';
import 'angular/core/services/workbench-context.service';
import 'angular/core/services/rdf4j-repositories.service';
import {UserRole} from 'angular/utils/user-utils';
import 'angular/utils/local-storage-adapter';
import 'angular/utils/uri-utils';
import 'angular/core/services/autocomplete.service';
import {decodeHTML} from '../../app';
import './guides/guides.service';
import './guides/directives';
import {GUIDE_PAUSE} from './guides/tour-lib-services/shepherd.service';
import 'angular-pageslide-directive/dist/angular-pageslide-directive';
import 'angularjs-slider/dist/rzslider.min';
import {DocumentationUrlResolver} from './utils/documentation-url-resolver';
import {NamespacesListModel} from './models/namespaces/namespaces-list';
import {
    ApplicationLifecycleContextService,
    AuthorizationService,
    AuthenticationService,
    COOKIE_CONSENT_CHANGED_EVENT,
    EventName,
    EventService,
    RepositoryContextService,
    LicenseContextService,
    LicenseService,
    RepositoryService,
    REPOSITORY_ID_PARAM,
    service,
    SecurityContextService,
    OntoToastrService,
    WindowService,
} from '@ontotext/workbench-api';
import {EventConstants} from './utils/event-constants';
import {CookieConsent} from './models/cookie-policy/cookie-consent';

angular
    .module('graphdb.workbench.se.controllers', [
        'graphdb.framework.core.services.jwtauth',
        'graphdb.framework.core.services.repositories',
        'graphdb.framework.core.services.trackingService',
        'ngCookies',
        'ngFileUpload',
        'graphdb.framework.core',
        'graphdb.framework.core.controllers',
        'graphdb.framework.core.directives',
        'graphdb.framework.rest.autocomplete.service',
        'graphdb.framework.rest.repositories.service',
        'graphdb.framework.rest.sparql.service',
        'graphdb.framework.rest.plugins.service',
        'graphdb.framework.rest.monitoring.service',
        'graphdb.framework.utils.localstorageadapter',
        'graphdb.framework.core.services.autocomplete',
        'graphdb.framework.utils.uriutils',
        'graphdb.framework.guides.directives',
        'graphdb.framework.guides.services',
        'pageslide-directive',
        'graphdb.core.services.workbench-context',
        'graphdb.framework.core.services.rdf4j.repositories',
        'rzSlider',
    ])
    .controller('mainCtrl', mainCtrl)
    .controller('homeCtrl', homeCtrl)
    .controller('repositorySizeCtrl', repositorySizeCtrl)
    .controller('uxTestCtrl', uxTestCtrl);

homeCtrl.$inject = ['$scope',
    '$rootScope',
    '$http',
    '$location',
    '$repositories',
    '$jwtAuth',
    '$translate',
    'AutocompleteRestService',
    'RepositoriesRestService',
    'WorkbenchContextService',
    'RDF4JRepositoriesService',
    'toastr'];

function homeCtrl($scope,
    $rootScope,
    $http,
    $location,
    $repositories,
    $jwtAuth,
    $translate,
    AutocompleteRestService,
    RepositoriesRestService,
    WorkbenchContextService,
    RDF4JRepositoriesService,
    toastr) {
    // =========================
    // Private variables
    // =========================
    const authenticationService = service(AuthenticationService);
    const authorizationService = service(AuthorizationService);
    const repositoryContextService = service(RepositoryContextService);

    // =========================
    // Public variables
    // =========================
    $scope.doClear = false;

    // =========================
    // Public functions
    // =========================

    $scope.goToSparqlEditor = function(query) {
        $location.path('/sparql').search({savedQueryName: query.name, owner: query.owner, execute: true});
    };

    $scope.goToEditRepo = function(repository) {
        $location.path(`repository/edit/${repository.id}`).search({previous: 'home', location: repository.location});
    };

    $scope.getActiveRepositorySize = () => {
        const repo = repositoryContextService.getSelectedRepository();

        if (!repo) {
            return;
        }
        $scope.activeRepositorySizeError = undefined;

        service(RepositoryService).getRepositorySizeInfo(repo)
            .then(function(repositorySizeInfo) {
                $scope.activeRepositorySize = repositorySizeInfo;
            })
            .catch(function(e) {
                $scope.activeRepositorySizeError = e.data?.message;
            });
    };

    $scope.onKeyDown = function(event) {
        if (event.keyCode === 27) {
            $scope.doClear = true;
        }
    };

    // =================================
    // Subscriptions and event handlers
    // =================================
    const subscriptions = [];

    const onSelectedRepositoryUpdated = (repository) => {
        const hasGqlRights = authorizationService.hasGqlRights(repository);

        // Don't call API, if no repo ID, or with GQL read-only or write rights
        if (!repository || hasGqlRights) {
            $scope.repositoryNamespaces = new NamespacesListModel();
            return;
        }
        $scope.getActiveRepositorySize();
        RDF4JRepositoriesService.getNamespaces(repository.id)
            .then((repositoryNamespaces) => {
                $scope.repositoryNamespaces = repositoryNamespaces;
            })
            .catch((error) => {
                const msg = getError(error);
                toastr.error(msg, $translate.instant('error.getting.namespaces.for.repo'));
            });
    };

    const onAutocompleteEnabledUpdated = (autocompleteEnabled) => {
        $scope.isAutocompleteEnabled = autocompleteEnabled;
    };

    subscriptions.push(repositoryContextService.onSelectedRepositoryChanged(onSelectedRepositoryUpdated));
    subscriptions.push(WorkbenchContextService.onAutocompleteEnabledUpdated(onAutocompleteEnabledUpdated));

    $scope.$on('$destroy', () => subscriptions.forEach((subscription) => subscription()));

    $scope.$on('$routeChangeSuccess', function($event, current, previous) {
        if (previous) {
            // If previous is defined we got here through navigation, hence security is already
            // initialized and its safe to refresh the repository info.
            if (authenticationService.isAuthenticated() || authorizationService.hasFreeAccess()) {
                // Security is OFF or security is ON but we are authenticated
                $scope.getActiveRepositorySize();
            } else {
                // Security is ON and we aren't authenticated, redirect to login page
                $rootScope.redirectToLogin();
            }
        }
    });
}

mainCtrl.$inject = ['$scope', '$menuItems', '$jwtAuth', '$http', '$location', '$repositories', '$rootScope',
    'productInfo', '$timeout', 'ModalService', '$interval', '$filter', 'RepositoriesRestService',
    'MonitoringRestService', 'SparqlRestService', '$sce', 'LocalStorageAdapter', 'LSKeys', '$translate', 'UriUtils', '$q', 'GuidesService', '$route', '$window', 'TrackingService',
    'WorkbenchContextService', 'AutocompleteService'];

function mainCtrl($scope, $menuItems, $jwtAuth, $http, $location, $repositories, $rootScope,
    productInfo, $timeout, ModalService, $interval, $filter, RepositoriesRestService,
    MonitoringRestService, SparqlRestService, $sce, LocalStorageAdapter, LSKeys, $translate, UriUtils, $q, GuidesService, $route, $window, TrackingService,
    WorkbenchContextService, AutocompleteService) {
    // =========================
    // Private variables
    // =========================

    const toastrService = service(OntoToastrService);
    const licenseService = service(LicenseService);
    const authorizationService = service(AuthorizationService);
    const authenticationService = service(AuthenticationService);
    const securityContextService = service(SecurityContextService);
    const repositoryContextService = service(RepositoryContextService);
    /**
     * When the timeout finishes, the popover will open.
     */
    let popoverTimer;
    // Selected repository ID change event is fired when the user changes the repository from the dropdown or by
    // selecting a repository from the repository list page. This triggers the event in the current tab and also stores
    // the new repository ID in the local storage. Local storage change event is handled by a central handler
    // LocalStorageSubscriptionHandlerService in the api module which triggers the change for the respective context
    // properties.
    let onSelectedRepositoryChangedSubscription;

    // =========================
    // Public variables
    // =========================

    $scope.popoverTemplate = 'js/angular/templates/repositorySize.html';
    $scope.securityEnabled = true;
    $scope.descr = $translate.instant('main.gdb.description');
    $scope.documentation = '';
    $scope.menu = $menuItems;
    $scope.menuCollapsed = false;
    $scope.tutorialState = LocalStorageAdapter.get(LSKeys.TUTORIAL_STATE) !== 1;
    $scope.userLoggedIn = false;
    $scope.embedded = $location.search().embedded;
    $scope.productInfo = productInfo;
    $scope.guidePaused = 'true' === LocalStorageAdapter.get(GUIDE_PAUSE);
    $scope.startGuideAfterSecurityInit = true;
    $scope.licenseIsSet = false;
    $scope.hideRdfResourceSearch = false;
    $scope.graphdbVersion = $scope.engineVersion = productInfo.productVersion;
    $scope.workbenchVersion = productInfo.Workbench;
    $scope.connectorsVersion = productInfo.connectors;
    $scope.sesameVersion = productInfo.sesame;
    $scope.isActiveRepoPopoverOpen = false;

    // =========================
    // Public functions
    // =========================

    $scope.showLabel = function(item) {
        return item.children ? true : !$scope.menuCollapsed;
    };

    //Copy to clipboard popover options
    $scope.copyToClipboard = function(uri) {
        ModalService.openCopyToClipboardModal(uri);
    };

    $scope.getLocationFromUri = function(location) {
        return $repositories.getLocationFromUri(location);
    };

    $scope.resumeGuide = function() {
        $rootScope.$broadcast('guideResume');
    };

    $scope.resolveUrl = (productVersion, endpointPath) => DocumentationUrlResolver.getDocumentationUrl(productVersion, endpointPath);

    $scope.isSecurityEnabled = function() {
        return authenticationService.isSecurityEnabled();
    };

    $scope.isFreeAccessEnabled = function() {
        return authorizationService.hasFreeAccess();
    };

    $scope.hasExternalAuthUser = function() {
        return authenticationService.isExternalUser();
    };

    $scope.isDefaultAuthEnabled = function() {
        return $jwtAuth.isDefaultAuthEnabled();
    };

    $scope.isUserLoggedIn = function() {
        return $scope.userLoggedIn;
    };

    $scope.hasActiveLocation = function() {
        return $repositories.hasActiveLocation();
    };

    $scope.getActiveLocation = function() {
        return $repositories.getActiveLocation();
    };

    $scope.isLoadingLocation = function() {
        return $repositories.isLoadingLocation();
    };

    $scope.getRepositories = function() {
        return $repositories.getRepositories();
    };

    $scope.getReadableRepositories = function() {
        return $repositories.getReadableRepositories();
    };

    $scope.getWritableRepositories = function() {
        return $repositories.getWritableRepositories();
    };

    $scope.getActiveRepository = function() {
        return $repositories.getActiveRepository();
    };

    $scope.canWriteRepoInLocation = function(repository) {
        return authorizationService.canWriteRepo(repository);
    };

    $scope.canWriteActiveRepo = function(noSystem) {
        const activeRepository = $repositories.getActiveRepositoryObject();
        if (activeRepository) {
            // If the parameter noSystem is true then we don't allow write access to the SYSTEM repository
            return authorizationService.canWriteRepo(activeRepository)
                && (activeRepository.id !== 'SYSTEM' || !noSystem);
        }
        return false;
    };

    $scope.getActiveRepositoryObject = function() {
        return $repositories.getActiveRepositoryObject();
    };

    $scope.getActiveRepositoryShortLocation = function() {
        const repo = $repositories.getActiveRepositoryObject();
        if (repo) {
            const location = repo.location;
            if (location) {
                return '@' + UriUtils.shortenIri(location);
            }
        }

        return '';
    };

    $scope.isActiveRepoOntopType = function() {
        return $repositories.isActiveRepoOntopType();
    };

    $scope.isActiveRepoFedXType = function() {
        return $repositories.isActiveRepoFedXType();
    };

    $scope.isLicensePresent = function() {
        return !!$scope.license?.present;
    };

    $scope.isLicenseValid = function() {
        return !!$scope.license?.valid;
    };

    /**
     *  Sets attrs property in the directive
     * @param attrs
     */
    $scope.setAttrs = function(attrs) {
        $scope.attrs = attrs;
    };

    /**
     *  If the license is not valid or
     *  If the attribute "write" is provided and repository other than Ontop one,
     * directive will require a repository with write access.
     *  If on the other hand attribute "ontop" or "fedx" is found and such repo, proper message about the
     * restrictions related with repository of type Ontop or FedX will be shown to the user
     */
    $scope.setRestricted = function() {
        if ($scope.attrs) {
            $scope.isRestricted =
                $scope.attrs.hasOwnProperty('license') && !$scope.license?.valid ||
                $scope.attrs.hasOwnProperty('write') && $scope.isSecurityEnabled() && !$scope.canWriteActiveRepo() ||
                $scope.attrs.hasOwnProperty('ontop') && $scope.isActiveRepoOntopType() ||
                $scope.attrs.hasOwnProperty('fedx') && $scope.isActiveRepoFedXType();
        }
    };

    $scope.toHumanReadableType = function(type) {
        switch (type) {
            case 'graphdb':
                return 'Graphdb';
            case 'system':
                return 'System';
            case 'ontop':
                return 'Ontop';
            case 'fedx':
                return 'FedX';
            default:
                return 'Unknown';
        }
    };

    $scope.setRepository = function(repository) {
        $repositories.setRepository(repository);
    };

    $scope.showMainManuAndStatusBar = () => {
        return authenticationService.isAuthenticated() || $scope.isSecurityEnabled() && $scope.isFreeAccessEnabled();
    };

    $scope.isAdmin = function() {
        return authorizationService.isAdmin();
    };

    $scope.isUser = function() {
        return $scope.hasRole(UserRole.ROLE_USER);
    };

    $scope.hasRole = function(role) {
        if (!angular.isUndefined(role)) {
            return authorizationService.hasRole(role);
        }
        return true;
    };

    $scope.hasPermission = function() {
        return $rootScope.hasPermission();
    };

    $scope.canReadRepo = function(repo) {
        return authorizationService.canReadRepo(repo);
    };

    $scope.hasAuthority = function() {
        return authorizationService.hasAuthority();
    };

    $scope.hasGraphqlRightsOverCurrentRepo = function() {
        return authorizationService.hasGraphqlRightsOverCurrentRepo();
    };

    $scope.setPopoverRepo = function(repository) {
        $scope.popoverRepo = repository;
    };

    // When the dropdown list is open, the popover of the already selected repo should disappear on mouseover on any of the listed options
    $scope.handlePopovers = function(repository) {
        $scope.setPopoverRepo(repository);
        $scope.closeActiveRepoPopover();
    };

    $scope.isRepoActive = function(repository) {
        return $repositories.isRepoActive(repository);
    };

    $scope.getRepositorySize = function() {
        $scope.repositorySize = {};
        if ($scope.popoverRepo) {
            $scope.repositorySize.loading = true;
            RepositoriesRestService.getSize($scope.popoverRepo).then(function(res) {
                $scope.repositorySize = res.data;
            });
        }
    };

    $scope.openActiveRepoPopover = function() {
        if ($scope.getActiveRepository()) {
            $scope.cancelPopoverOpen();
            popoverTimer = $timeout(function() {
                $scope.isActiveRepoPopoverOpen = true;
            }, 1000);
        }
    };

    /**
     * Cancels the popover timer.
     */
    $scope.cancelPopoverOpen = function() {
        $timeout.cancel(popoverTimer);
    };

    $scope.closeActiveRepoPopover = function() {
        $scope.isActiveRepoPopoverOpen = false;
    };

    $scope.getDegradedReason = function() {
        return $repositories.getDegradedReason();
    };

    $scope.canManageRepositories = function() {
        return authorizationService.hasRole(UserRole.ROLE_REPO_MANAGER) && !$repositories.getDegradedReason();
    };

    $scope.getSavedQueries = function() {
        SparqlRestService.getSavedQueries()
            .success(function(data) {
                $scope.sampleQueries = data;
            })
            .error(function(data) {
                const msg = getError(data);
                toastrService.error(msg, $translate.instant('query.editor.get.saved.queries.error'));
            });
    };

    $scope.declineTutorial = function() {
        LocalStorageAdapter.set(LSKeys.TUTORIAL_STATE, 1);
        $scope.tutorialState = false;
    };

    $scope.showTutorial = function() {
        $scope.tutorialState = true;
        LocalStorageAdapter.remove(LSKeys.TUTORIAL_STATE);
    };

    $scope.initTutorial = function() {
        if (!$scope.tutorialState && !isHomePage()) {
            return;
        }
        $scope.tutorialInfo = [
            {
                'title': $translate.instant('main.info.title.welcome.page'),
                'info': '<p>' + decodeHTML($translate.instant('main.info.welcome.page')) + '</p>'
                    + '<p>' + decodeHTML($translate.instant('main.info.welcome.page.guides')) + '</p>'
                    + '<p>' + decodeHTML($translate.instant('main.info.welcome.page.footer')) + '</p>',
            },
            {
                'title': $translate.instant('main.info.title.create.repo.page'),
                'info': decodeHTML($translate.instant('main.info.create.repo.page', {link: '<a href="https://graphdb.ontotext.com/documentation/' + productInfo.productShortVersion + '/configuring-a-repository.html" target="_blank">'})),
            },
            {
                'title': $translate.instant('main.info.title.load.sample.dataset'),
                'info': $translate.instant('main.info.load.sample.dataset'),
            },
            {
                'title': $translate.instant('main.info.title.run.sparql.query'),
                'info': decodeHTML($translate.instant('main.info.run.sparql.query')),
            },
            {
                'title': $translate.instant('menu.rest.api.label'),
                'info': decodeHTML($translate.instant('main.info.rest.api')),
            },
        ];
        $scope.activePage = 0;
        $('.pages-wrapper .page-slide').css('opacity', 100);
        const widthOfParentElm = $('.main-container')[0].offsetWidth + 200;
        $timeout(function() {
            const $pageSlider = $('.pages-wrapper .page-slide');
            $pageSlider.css('left', widthOfParentElm + 'px');
            $($pageSlider[$scope.activePage]).css('left', 0 + 'px');
            $($('.btn-toolbar.pull-right .btn-group .btn')[0]).focus();
        }, 50);
    };

    $scope.getTutorialPageHtml = function(page) {
        return $sce.trustAsHtml(page.info);
    };

    $scope.slideToPage = function(index) {
        const widthOfParentElm = $('.main-container')[0].offsetWidth;
        const $pageSlider = $('.pages-wrapper .page-slide');
        $pageSlider.css('opacity', '0').delay(200).css('left', widthOfParentElm + 'px');
        $scope.activePage = index;
        $($pageSlider[$scope.activePage]).css('opacity', '100').css('left', 0 + 'px');
    };

    $scope.slideNext = function() {
        let nextPageIndex = ++$scope.activePage;
        if (nextPageIndex >= $scope.tutorialInfo.length) {
            nextPageIndex = 0;
        }
        $scope.slideToPage(nextPageIndex);
        $($('.btn-toolbar.pull-right .btn-group .btn')[$scope.activePage]).focus();
    };

    $scope.isTrackingAllowed = function() {
        if (!$scope.licenseIsSet) {
            return;
        }
        return TrackingService.isTrackingAllowed();
    };

    $scope.getProductType = function() {
        return $scope.license?.productType;
    };

    $scope.isEnterprise = function() {
        return $scope.getProductType() === 'enterprise';
    };

    $scope.isFreeEdition = function() {
        return $scope.getProductType() === 'free';
    };

    $scope.checkEdition = function(editions) {
        if (editions === null) {
            return true;
        }
        return _.indexOf(editions, $scope.getProductType()) >= 0;
    };

    $scope.getLicense = function() {
        return $scope.license;
    };

    $scope.getLicenseErrorMsg = function() {
        const NO_LICENSE_MSG = 'No license was set';

        if (!$scope.license?.present && $scope.license?.message === NO_LICENSE_MSG) {
            return $translate.instant('no.license.set.msg');
        } else {
            return $translate.instant('error.license', {message: $scope.license?.message});
        }
    };

    $scope.getHumanReadableSeconds = function(s, preciseSeconds) {
        const days = Math.floor(s / 86400);
        const hours = Math.floor((s % 86400) / 3600);
        const minutes = Math.floor((s % 3600) / 60);
        // preciseSeconds = true and s < 10 will use fractional seconds rounded to one decimal place,
        // elsewhere it will be rounded up to an integer.
        let seconds;
        if (preciseSeconds && s < 10) {
            if (s < 1) {
                // avoid returning 0 for times less than 0.1s
                seconds = _.ceil(s % 60, 1);
            } else {
                seconds = _.round(s % 60, 1);
            }
        } else {
            seconds = _.round(s % 60, 0);
        }
        let message = '';
        if (days) {
            message += days + 'd ';
        }
        if (days || hours) {
            message += hours + 'h ';
        }
        if (days || hours || minutes) {
            message += minutes + 'm ';
        }
        message += seconds + 's';
        return message.replace(/( 0[a-z])+$/, '');
    };

    $scope.getHumanReadableTimestamp = function(time) {
        const now = Date.now();
        const delta = (now - time) / 1000;
        if (delta < 60) {
            return $translate.instant('timestamp.moments.ago');
        } else if (delta < 600) {
            return $translate.instant('timestamp.minutes.ago');
        } else {
            const dNow = new Date(now);
            const dTime = new Date(time);
            if (dNow.getYear() === dTime.getYear() && dNow.getMonth() === dTime.getMonth() && dNow.getDate() === dTime.getDate()) {
                // today
                return $filter('date')(time, '\'' + $translate.instant('timestamp.today.at') + '\' HH:mm');
            } else if (delta < 86400) {
                // yesterday
                return $filter('date')(time, '\'' + $translate.instant('timestamp.yesterday.at') + '\' HH:mm');
            }
        }

        return $filter('date')(time, ('\'' + $translate.instant('timestamp.on') + '\' yyyy-MM-dd \'' + $translate.instant('timestamp.at') + '\' HH:mm'));
    };

    $scope.downloadGuidesFile = (resourcePath, resourceFile) => {
        GuidesService.downloadGuidesFile(resourcePath, resourceFile)
            .catch(() => {
                toastrService.error($translate.instant('guide.step_plugin.download-guide-resource.download.message.failure', {resourceFile}));
            });
    };

    // =========================
    // Private functions
    // =========================

    const startGuide = (guideId) => {
        // Check to see if $translate service is ready with the language before starting the guide as the steps are translated ahead on time. Will retry 20 times (1 second).
        const timer = $interval(function() {
            if ($translate.use()) {
                GuidesService.autoStartGuide(guideId);
                $interval.cancel(timer);
            }
        }, 50, 20);
    };

    const isHomePage = () => {
        return $location.url() === '/';
    };

    const isLoginPage = () => {
        return $location.url().startsWith('/login');
    };

    const setYears = function() {
        const date = new Date();
        $scope.currentYear = date.getFullYear();
        $scope.previousYear = 2002; // Peio says this is 2002 or 2003, in other words the year of the earliest file.
    };

    function updateCookieConsentHandler(consentChangedEvent) {
        const consent = CookieConsent.fromJSON(consentChangedEvent.detail);
        TrackingService.updateCookieConsent(consent);
    }

    const subscribeToCookieConsentChanged = () => {
        document.body.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, updateCookieConsentHandler);
        return () => document.body.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, updateCookieConsentHandler);
    };

    const onLicenseUpdated = (license) => {
        $scope.license = license;
    };

    function setPrincipal() {
        $scope.principal = securityContextService.getAuthenticatedUser();
        $scope.isIgnoreSharedQueries = $scope.principal && $scope.principal.appSettings.IGNORE_SHARED_QUERIES;
    }

    function logout() {
        const authorizationService = service(AuthorizationService);

        if (authorizationService.hasFreeAccess()) {
            // if it's free access check if we still can access the current repo
            // if not, a new default repo will be set or the current repo will be unset
            $repositories.resetActiveRepository();
        }
        // clearAuthentication() triggers broadcast of `securityInit` which triggers $rootScope.redirectToLogin()
        $jwtAuth.clearAuthentication();
        toastrService.success($translate.instant('sign.out.success'));
    }

    const closeActiveRepoPopoverEventHandler = function(event) {
        const popoverElement = document.querySelector('.popover');
        if ($scope.isActiveRepoPopoverOpen && popoverElement && !popoverElement.contains(event.target)) {
            $timeout(function() {
                $scope.isActiveRepoPopoverOpen = false;
            }, 0);
        }
    };

    const localStoreChangeHandler = (localStoreEvent) => {
        if ('ls.' + LSKeys.AUTOCOMPLETE_ENABLED === localStoreEvent.key) {
            WorkbenchContextService.setAutocompleteEnabled(localStoreEvent.newValue === 'true');
        }
    };

    const securityConfigChangedHandler = (securityConfig) => {
        $scope.securityEnabled = securityConfig.isEnabled();
        $scope.userLoggedIn = authenticationService.isLoggedIn();

        // Handles all cases of pages accessible without being logged and without having free access ON
        if ($scope.securityEnabled && !$scope.userLoggedIn && !securityConfig.isFreeAccessEnabled()) {
            if (!isLoginPage()) {
                $rootScope.redirectToLogin();
            }
        } else {
            setPrincipal();

            $scope.getSavedQueries();

            licenseService.updateLicenseStatus()
                .then(() => {
                    $scope.licenseIsSet = true;
                    return TrackingService.applyTrackingConsent();
                })
                .catch((error) => {
                    $scope.licenseIsSet = false;
                    const msg = getError(error.data, error.status);
                    toastrService.error(msg, $translate.instant('common.error'));
                });

            const queryParams = $location.search();
            if (authorizationService.isRepoManager() && $scope.startGuideAfterSecurityInit && queryParams.autostartGuide) {
                startGuide(queryParams.autostartGuide);
                $scope.startGuideAfterSecurityInit = false;
            }
        }
    };

    const updateAutocompleteStatus = () => {
        if ($repositories.isActiveRepoFedXType() || !$scope.license?.valid || !authorizationService.canReadRepo($repositories.getActiveRepositoryObject())) {
            WorkbenchContextService.setAutocompleteEnabled(false);
            LocalStorageAdapter.set(LSKeys.AUTOCOMPLETE_ENABLED, false);
            return;
        }
        AutocompleteService.checkAutocompleteStatus()
            .then((autocompleteEnabled) => {
                WorkbenchContextService.setAutocompleteEnabled(autocompleteEnabled);
                LocalStorageAdapter.set(LSKeys.AUTOCOMPLETE_ENABLED, autocompleteEnabled);
            })
            .catch(() => {
                toastrService.error($translate.instant('explore.error.autocomplete'));
            });
    };

    const onRepositoryChanged = () => {
        const activeRepository = $repositories.getActiveRepository();
        if (activeRepository !== WorkbenchContextService.getSelectedRepositoryId()) {
            WorkbenchContextService.setSelectedRepositoryId(activeRepository);
        }
        updateAutocompleteStatus();
    };

    const onApplicationDataStateChangedHandler = (dataLoaded) => {
        if (dataLoaded) {
            // unsubscribe of any previous subscription
            onSelectedRepositoryChangedSubscription?.();
            onSelectedRepositoryChangedSubscription =
                repositoryContextService.onSelectedRepositoryChanged(onSelectedRepositoryUpdated);
        }
    };

    const confirmRepositoryChange = (currentRepositoryId, newRepositoryId) => {
        ModalService.openConfirmationModal({
                title: $translate.instant('common.confirm'),
                message: $translate.instant('repository.url_param.change_active_repo', {repositoryId: newRepositoryId}),
                confirmButtonKey: $translate.instant('common.confirm'),
            },
            () => {
                repositoryContextService.updateSelectedRepository({
                    id: newRepositoryId,
                    location: '',
                });
            },
            () => {
                // on cancel, revert the URL to the current repository
                $location.search(REPOSITORY_ID_PARAM, currentRepositoryId);
            });
    };

    let isFirstRepoChangeEvent = true;

    const onSelectedRepositoryUpdated = (repository) => {
        // skip the first event which is triggered on bootstrap
        if (!isFirstRepoChangeEvent) {
            // On repository change, update the url param accordingly, but
            // avoid infinite loop by checking if the param is already set to the desired value.
            // And skip the first event which is triggered on bootstrap.
            if (repository) {
                const searchParams = new URLSearchParams(WindowService.getLocationQueryParams());
                const urlRepositoryParam = searchParams.get(REPOSITORY_ID_PARAM);
                if (urlRepositoryParam !== repository.id) {
                    $location.search(REPOSITORY_ID_PARAM, repository.id).replace();
                }
            }
        }
        isFirstRepoChangeEvent = false;
        // Notify the $repositories service about the repository change so it can update its state
        $repositories.onRepositorySet(repository);
    };

    // 1. active repo no, repo in url no -> no action - just show repo selector
    // 2. active repo no, repo in url yes, url repo exists -> set active repo same as the url
    // 3. active repo no, repo in url yes, url repo missing -> show warning, keep url
    // 4. active repo yes, repo in url no -> update url
    // 5. active repo yes, repo in url yes, url repo exists -> show confirmation, update active repo
    // 6. active repo yes, repo in url yes, url repo missing-> show warning, keep the active repo
    const onRouteChangeStart = (event) => {
        const repositoryIdParam = $location.search()[REPOSITORY_ID_PARAM];
        const selectedRepository = repositoryContextService.getSelectedRepository();

        const repositoryExists = repositoryIdParam
            ? repositoryContextService.repositoryExists({id: repositoryIdParam, location: ''})
            : false;

        const isSameRepository = !!selectedRepository && repositoryIdParam === selectedRepository.id;

        // --- no selected repository ---

        if (!selectedRepository) {
            // 1. active repo no, repo in url no -> no action - just show repo selector
            if (!repositoryIdParam) {
                return;
            }

            // 2. active repo no, repo in url yes, url repo exists -> set active repo same as the url
            if (repositoryExists) {
                repositoryContextService.updateSelectedRepository({
                    id: repositoryIdParam,
                    location: '',
                });
                return;
            }

            // 3. active repo no, repo in url yes, url repo missing -> show warning, keep url
            ModalService.openModalAlert({
                title: $translate.instant('common.warning'),
                message: $translate.instant('repository.url_param.invalid_repo', {repositoryId: repositoryIdParam}),
            }).result;

            return;
        }

        // --- selected repository is present ---

        // 4. active repo yes, repo in url no -> update url
        if (!repositoryIdParam) {
            // The timeout is needed to ensure the location change happens after the current digest cycle
            $timeout(() => {
                $location.search(REPOSITORY_ID_PARAM, selectedRepository.id).replace();
            });
            return;
        }

        // 5. active repo yes, repo in url yes, same repo -> do nothing
        if (isSameRepository && repositoryExists) {
            return;
        }

        // 6. active repo yes, repo in url yes, url repo exists and is different -> confirm change
        if (repositoryExists) {
            confirmRepositoryChange(selectedRepository.id, repositoryIdParam);
            return;
        }

        // 7. active repo yes, repo in url yes, url repo missing -> warning, keep active repo and fix URL
        ModalService.openModalAlert({
            title: $translate.instant('common.warning'),
            message: $translate.instant('repository.url_param.invalid_repo_continue', {repositoryId: repositoryIdParam, currentRepositoryId: selectedRepository.id}),
        }).result.then(() => {
            // The timeout is needed to ensure the location change happens after the current digest cycle
            $timeout(() => {
                $location.search(REPOSITORY_ID_PARAM, selectedRepository.id).replace();
            });
        });
    };

    // =========================
    // Subscriptions and event handlers
    // =========================

    $('#repositorySelectDropdown').on('hide.bs.dropdown', function(e) {
        if (GuidesService.isActive()) {
            if ($('#repositorySelectDropdown.autoCloseOff').length > 0) {
                e.preventDefault();
            }
        }
    });

    $scope.$on('$routeChangeSuccess', function($event, current, previous) {
        $scope.clicked = false;
        $scope.hideRdfResourceSearch = false;
        if (previous) {
            // Recheck license status on navigation within the workbench (security is already inited)
            licenseService.updateLicenseStatus()
                .then(() => TrackingService.applyTrackingConsent())
                .catch((error) => {
                    const msg = getError(error.data, error.status);
                    toastrService.error(msg, $translate.instant('common.error'));
                });
        }
    });

    $scope.$on('$routeUpdate', function() {
        const repositoryIdParam = $location.search()[REPOSITORY_ID_PARAM];
        const selectedRepository = repositoryContextService.getSelectedRepository();
        if (selectedRepository && repositoryIdParam !== selectedRepository.id) {
            $location.search(REPOSITORY_ID_PARAM, selectedRepository.id).replace();
        }
    });

    $rootScope.$on('guideReset', function() {
        $scope.guidePaused = false;
        $rootScope.guidePaused = false;
    });

    $rootScope.$on('guideStarted', function() {
        $scope.guidePaused = false;
        $rootScope.guidePaused = false;
    });

    $rootScope.$on('guidePaused', function() {
        $scope.guidePaused = true;
        $rootScope.guidePaused = true;
    });

    $rootScope.$on('$translateChangeSuccess', function() {
        $scope.menu.forEach(function(menu) {
            menu.label = $translate.instant(menu.labelKey);
            if (menu.children) {
                menu.children.forEach(function(child) {
                    child.label = $translate.instant(child.labelKey);
                });
            }
        });

        $rootScope.helpInfo = $sce.trustAsHtml(decodeHTML($translate.instant($rootScope.helpInfo)));
        $rootScope.title = decodeHTML($translate.instant($rootScope.title));
        $scope.initTutorial();
    });

    let routeChangeStartSubscription = undefined;
    const subscribeToRouteChangeStart = () => {
        routeChangeStartSubscription = $rootScope.$on('$routeChangeStart', onRouteChangeStart);
    };
    subscribeToRouteChangeStart();

    service(EventService).subscribe(EventName.APPLICATION_MOUNTED, (payload) => {
        subscribeToRouteChangeStart();
    });

    service(EventService).subscribe(EventName.APPLICATION_UNMOUNTED, (payload) => {
        routeChangeStartSubscription?.();
    });

    $scope.$on('repositoryIsSet', function() {
        $scope.setRestricted();
        LocalStorageAdapter.clearClassHieararchyState();
    });

    const onLoginSubscription = service(EventService).subscribe(EventName.LOGIN, () => {
        $jwtAuth.initSecurity();
    });

    const onLogoutSubscription = service(EventService).subscribe(EventName.LOGOUT, () => logout());

    service(EventService).subscribe(EventConstants.RDF_SEARCH_ICON_CLICKED, () => {
        $rootScope.$broadcast('rdfResourceSearchExpanded');
    });

    document.addEventListener('click', closeActiveRepoPopoverEventHandler);

    const securityConfigChangedSubscription = securityContextService.onSecurityConfigChanged(securityConfigChangedHandler);

    $rootScope.$on('repositoryIsSet', onRepositoryChanged);

    /**
     * Add a listener for the browser's local store change event. This event will be fired in all tabs of the current domain
     * EXPECT FOR THE ONE where the local store changed.
     */
    window.addEventListener('storage', localStoreChangeHandler);

    const onAppDataLoaded = service(ApplicationLifecycleContextService).onApplicationDataStateChanged(onApplicationDataStateChangedHandler);

    // subscribe to repository changes, once we are certain they are loaded
    const licenseUpdatedSubscription = service(LicenseContextService).onLicenseChanged(onLicenseUpdated);
    const cookieConsentChangedSubscription = subscribeToCookieConsentChanged();

    // TODO: The $destroy hook is not called in the workbench unmounting process, so these subscriptions are not cleaned up.
    $scope.$on('$destroy', () => {
        onSelectedRepositoryChangedSubscription?.();
        cookieConsentChangedSubscription?.();
        licenseUpdatedSubscription?.();
        onAppDataLoaded?.();
        onLogoutSubscription?.();
        onLoginSubscription?.();
        securityConfigChangedSubscription?.();
        document.removeEventListener('click', closeActiveRepoPopoverEventHandler);
        window.removeEventListener('storage', localStoreChangeHandler);
        $scope.cancelPopoverOpen();
    });

    // =========================
    // Initialization
    // =========================

    const initialize = () => {
        setYears();

        $(window).resize(function() {
            if ($scope.tutorialState && isHomePage()) {
                $scope.initTutorial();
            }
        });

        if ($jwtAuth.securityInitialized) {
            $scope.getSavedQueries();
        }
    };

    initialize();
}

repositorySizeCtrl.$inject = ['$scope', '$http', 'RepositoriesRestService'];

function repositorySizeCtrl($scope, $http, RepositoriesRestService) {
    $scope.getRepositorySize = function(repository) {
        RepositoriesRestService.getSize(repository).then(function(res) {
            $scope.size = res.data;
        });
    };
}

uxTestCtrl.$inject = ['$scope', '$repositories', 'toastr', 'ModalService'];

function uxTestCtrl($scope, $repositories, toastr, ModalService) {
    $scope.colors = [
        {name: 'black', shade: 'dark'},
        {name: 'white', shade: 'light'},
        {name: 'red', shade: 'dark'},
        {name: 'blue', shade: 'dark'},
        {name: 'yellow', shade: 'light'},
    ];
    $scope.myColor = $scope.colors[2];

    $scope.specialValue = {
        'id': '12345',
        'value': 'green',
    };

    $scope.checkedItem = {name: 'black', shade: 'dark'};

    $scope.toggleOn = true;
    $scope.toggleSwitch = function() {
        $scope.toggleOn = !$scope.toggleOn;
    };

    $scope.repositories = ['Repo1', 'Repo2', 'Repo3'];
    $scope.formats = ['JSON', 'JSON-LD', 'Turtle'];

    $scope.onopen = $scope.onclose = () => angular.noop();
    $scope.openInfoPanel = false;
    $scope.showInfoPanel = function() {
        $scope.openInfoPanel = true;
    };
    $scope.closeInfoPanel = function() {
        $scope.openInfoPanel = false;
    };

    $scope.slideOpen = false;

    $scope.toggleSlide = function() {
        $scope.slideOpen = !$scope.slideOpen;
    };

    $scope.slider = {
        value: 10,
        minValue: 10,
        maxValue: 90,
        options: {
            floor: 0,
            ceil: 100,
            step: 1,
        },
    };

    $scope.openModal = function() {
        const modal = ModalService.openSimpleModal({
            title: 'Modal title',
            message: 'Lorem ipsum dolor sit amet.',
        });

        modal.result.then(function() {
            modal.dismiss('cancel');
        });
    };

    $scope.openConfirmation = function() {
        ModalService.openConfirmationModal({
            title: 'Confirmation',
            message: 'Confirm action',
        });
    };

    $scope.demoToast = function(alertType, secondArg = true) {
        toastr[alertType]('Consectetur adipiscing elit. Sic transit gloria mundi.',
            secondArg ? 'Lorem ipsum dolor sit amet' : undefined,
            {timeOut: 300000, extendedTimeOut: 300000});
    };

    $scope.clearToasts = function() {
        toastr.clear();
    };

    $scope.clearRepo = function() {
        $repositories.setRepository('');
    };
}
