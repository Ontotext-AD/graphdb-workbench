import 'angular/core/services';
import 'angular/rest/sparql.rest.service';
import 'angular/rest/autocomplete.rest.service';
import 'angular/rest/plugins.rest.service';
import 'angular/rest/monitoring.rest.service';
import 'angular/rest/license.rest.service';
import 'angular/rest/repositories.rest.service';
import 'angular/rest/rdf4j.repositories.rest.service';
import 'ng-file-upload/dist/ng-file-upload.min';
import 'ng-file-upload/dist/ng-file-upload-shim.min';
import 'angular/core/services/jwt-auth.service';
import 'angular/core/services/repositories.service';
import 'angular/core/services/license.service';
import {UserRole} from 'angular/utils/user-utils';
import 'angular/utils/local-storage-adapter';
import 'angular/utils/uri-utils';
import 'angular/core/services/autocomplete-status.service';
import {decodeHTML} from "../../app";
import './guides/guides.service';
import './guides/directives'
import {GUIDE_PAUSE} from './guides/tour-lib-services/shepherd.service'

angular
    .module('graphdb.workbench.se.controllers', [
        'graphdb.framework.core.services.jwtauth',
        'graphdb.framework.core.services.repositories',
        'graphdb.framework.core.services.licenseService',
        'ngCookies',
        'ngFileUpload',
        'graphdb.framework.core',
        'graphdb.framework.core.controllers',
        'graphdb.framework.core.directives',
        'graphdb.framework.rest.license.service',
        'graphdb.framework.rest.autocomplete.service',
        'graphdb.framework.rest.repositories.service',
        'graphdb.framework.rest.sparql.service',
        'graphdb.framework.rest.autocomplete.service',
        'graphdb.framework.rest.plugins.service',
        'graphdb.framework.rest.monitoring.service',
        'graphdb.framework.rest.rdf4j.repositories.service',
        'graphdb.framework.utils.localstorageadapter',
        'graphdb.framework.core.services.autocompleteStatus',
        'graphdb.framework.utils.uriutils',
        'graphdb.framework.guides.directives'
    ])
    .controller('mainCtrl', mainCtrl)
    .controller('homeCtrl', homeCtrl)
    .controller('repositorySizeCtrl', repositorySizeCtrl);

homeCtrl.$inject = ['$scope', '$rootScope', '$http', '$repositories', '$jwtAuth', '$licenseService', 'AutocompleteRestService', 'LicenseRestService', 'RepositoriesRestService', 'RDF4JRepositoriesRestService'];

function homeCtrl($scope, $rootScope, $http, $repositories, $jwtAuth, $licenseService, AutocompleteRestService, LicenseRestService, RepositoriesRestService, RDF4JRepositoriesRestService) {
    $scope.doClear = false;

    $scope.getActiveRepositorySize = function () {
        const repo = $repositories.getActiveRepositoryObject();
        if (!repo) {
            return;
        }
        $scope.activeRepositorySizeError = undefined;
        RepositoriesRestService.getSize(repo).then(function (res) {
            $scope.activeRepositorySize = res.data;
        }).catch(function (e) {
            $scope.activeRepositorySizeError = e.data.message;
        });
    };

    function refreshRepositoryInfo() {
        if ($scope.getActiveRepository()) {
            $scope.getNamespacesPromise = RDF4JRepositoriesRestService.getNamespaces($scope.getActiveRepository())
                .success(function () {
                    checkAutocompleteStatus();
                });
            // Getting the repository size should not be related to license
            $scope.getActiveRepositorySize();
        }
    }

    function checkAutocompleteStatus() {
        if ($licenseService.isLicenseValid()) {
            $scope.getAutocompletePromise = AutocompleteRestService.checkAutocompleteStatus();
        }
    }

    $scope.$on('autocompleteStatus', function() {
        checkAutocompleteStatus();
    });

    // Rather then rely on securityInit we monitory repositoryIsSet which is guaranteed to be called
    // after security was initialized. This way we avoid a race condition when the newly logged in
    // user doesn't have read access to the active repository.
    $scope.$on('repositoryIsSet', refreshRepositoryInfo);

    $scope.$on('$routeChangeSuccess', function ($event, current, previous) {
        if (previous) {
            // If previous is defined we got here through navigation, hence security is already
            // initialized and its safe to refresh the repository info.
            if ($jwtAuth.isAuthenticated() || $jwtAuth.isFreeAccessEnabled()) {
                // Security is OFF or security is ON but we are authenticated
                refreshRepositoryInfo();
            } else {
                // Security is ON and we aren't authenticated, redirect to login page
                $rootScope.redirectToLogin();
            }
        }
    });

    $scope.onKeyDown = function (event) {
        if (event.keyCode === 27) {
            $scope.doClear = true;
        }
    };

}

mainCtrl.$inject = ['$scope', '$menuItems', '$jwtAuth', '$http', 'toastr', '$location', '$repositories', '$licenseService', '$rootScope',
    'productInfo', '$timeout', 'ModalService', '$interval', '$filter', 'LicenseRestService', 'RepositoriesRestService',
    'MonitoringRestService', 'SparqlRestService', '$sce', 'LocalStorageAdapter', 'LSKeys', '$translate', 'UriUtils', '$q'];

function mainCtrl($scope, $menuItems, $jwtAuth, $http, toastr, $location, $repositories, $licenseService, $rootScope,
                  productInfo, $timeout, ModalService, $interval, $filter, LicenseRestService, RepositoriesRestService,
                  MonitoringRestService, SparqlRestService, $sce, LocalStorageAdapter, LSKeys, $translate, UriUtils, $q) {
    $scope.descr = $translate.instant('main.gdb.description');
    $scope.documentation = '';
    $scope.menu = $menuItems;
    $scope.tutorialState = LocalStorageAdapter.get(LSKeys.TUTORIAL_STATE) !== 1;
    $scope.userLoggedIn = false;
    $scope.embedded = $location.search().embedded;
    $scope.productInfo = productInfo;
    $scope.guidePaused = 'true' === LocalStorageAdapter.get(GUIDE_PAUSE);

    const setYears = function () {
        const date = new Date();
        $scope.currentYear = date.getFullYear();
        $scope.previousYear = 2002; // Peio says this is 2002 or 2003, in other words the year of the earliest file.
    };

    setYears();

    $scope.$on("$routeChangeSuccess", function ($event, current, previous) {
        $scope.clicked = false;
        $('.menu-element-root').removeClass('active');
        $timeout(function () {
            $('.menu-element.open a.menu-element-root').addClass('active');
            $('.main-menu.collapsed .menu-element.open .menu-element-root').addClass('active');
        }, 400);
        if (previous) {
            // Recheck license status on navigation within the workbench (security is already inited)
            $licenseService.checkLicenseStatus();
        }
    });

    $scope.resumeGuide = function () {
        $scope.guidePaused = false;
        $rootScope.guidePaused = false;
        $rootScope.$broadcast('guideResume');
    }

    $rootScope.$on('guideReset', function () {
        $scope.guidePaused = false;
        $rootScope.guidePaused = false;
    });

    $rootScope.$on('guidePaused', function () {
        $scope.guidePaused = true;
        $rootScope.guidePaused = true;
    });

    $rootScope.$on('$translateChangeSuccess', function () {
        $scope.menu.forEach(function (menu) {
            menu.label = $translate.instant(menu.labelKey);
            if (menu.children) {
                menu.children.forEach(function (child) {
                    child.label = $translate.instant(child.labelKey);
                });
            }
        });

        $rootScope.helpInfo = $sce.trustAsHtml(decodeHTML($translate.instant($rootScope.helpInfo)));
        $rootScope.title = decodeHTML($translate.instant($rootScope.title));
        $scope.initTutorial();
    });

    $scope.checkMenu = function () {
        return $('.main-menu').hasClass('collapsed');
    };

    //Copy to clipboard popover options
    $scope.copyToClipboard = function (uri) {
        ModalService.openCopyToClipboardModal(uri);
    };

    $scope.goToAddRepo = function () {
        $location.path('/repository/create').search({previous: 'home'});
    };

    $scope.goToEditRepo = function (repository) {
        $location.path(`repository/edit/${repository.id}`).search({previous: 'home', location: repository.location});
    };

    $scope.getLocationFromUri = function (location) {
        return $repositories.getLocationFromUri(location);
    }

    $scope.$on("$locationChangeSuccess", function () {
        $scope.showFooter = $location.url() === '/';
    });

    $scope.$on("repositoryIsSet", function () {
        $scope.setRestricted();
        LocalStorageAdapter.clearClassHieararchyState();
    });

    $scope.graphdbVersion =
        $scope.engineVersion = productInfo.productVersion;
    $scope.workbenchVersion = productInfo.Workbench;

    $scope.connectorsVersion = productInfo.connectors;

    $scope.sesameVersion = productInfo.sesame;

    $scope.select = function (index, event, clicked) {
        if ($('.main-menu').hasClass('collapsed')) {
            if (!$(event.target).parents(".menu-element").children('.menu-element-root').hasClass('active')) {
                if (!$(event.target).parents(".menu-element").hasClass('open') && clicked) {
                    $scope.clicked = true;
                } else {
                    $scope.clicked = !clicked;
                }
                if ($scope.selected === index) {
                    $scope.selected = -1;
                } else {
                    $scope.selected = index;
                }
            } else {
                $scope.selected = index;
                $scope.clicked = !clicked;
            }
        } else {
            if (!$(event.target).parents(".menu-element").hasClass('open') && clicked) {
                $scope.clicked = true;
            } else {
                $scope.clicked = !clicked;
            }
            if ($(event.target).parent(".menu-element").find(".sub-menu").length !== 0) {
                if ($(event.target).parents(".menu-element").children('.menu-element-root').hasClass('active')) {
                    $('.sub-menu li.active').parents('.menu-element').children('.menu-element-root').removeClass('active');
                } else {
                    $('.sub-menu li.active').parents('.menu-element').children('.menu-element-root').addClass('active');
                }
                if ($scope.selected === index) {
                    $scope.selected = -1;
                } else {
                    $scope.selected = index;
                }
            } else {
                $timeout(function () {
                    $(event.target).parents(".menu-element").children('.menu-element-root').addClass('active');
                }, 50);
                $scope.selected = index;
            }
        }
    };

    $('body').bind('click', function (e) {
        if (!$(e.target).parents(".main-menu").length && $('.main-menu').hasClass('collapsed')) {
            $scope.clicked = false;
            $scope.selected = -1;
        }
    });

    $scope.isCurrentPath = function (path) {
        return $location.path() === '/' + path;
    };

    $scope.isCurrentSubmenuChildPath = function (submenu) {
        if (submenu.children.length !== 0) {
            return submenu.children.some(function (child) {
                return $scope.isCurrentPath(child.href);
            });
        }

        return false;
    };

    if ($location.path() === '/') {
        $scope.selected = -1;
    } else {
        $timeout(function () {
            const route = $location.path().replace('/', '');
            const elem = $('a[href^="' + route + '"]');
            $scope.selected = elem.closest('.menu-element').index() - 1;
        }, 200);
        $scope.isCurrentPath($location.path());
    }

    $scope.popoverTemplate = 'js/angular/templates/repositorySize.html';

    $scope.securityEnabled = true;
    $scope.isSecurityEnabled = function () {
        return $jwtAuth.isSecurityEnabled();
    };
    $scope.isFreeAccessEnabled = function () {
        return $jwtAuth.isFreeAccessEnabled();
    };
    $scope.hasExternalAuthUser = function() {
        return $jwtAuth.hasExternalAuthUser();
    };
    $scope.isDefaultAuthEnabled = function () {
        return $jwtAuth.isDefaultAuthEnabled();
    };

    $scope.isUserLoggedIn = function () {
        return $scope.userLoggedIn;
    };

    $scope.hasActiveLocation = function () {
        return $repositories.hasActiveLocation();
    };

    $scope.getActiveLocation = function () {
        return $repositories.getActiveLocation();
    };

    $scope.isLoadingLocation = function () {
        return $repositories.isLoadingLocation();
    };

    $scope.getRepositories = function () {
        return $repositories.getRepositories();
    };

    $scope.getReadableRepositories = function () {
        return $repositories.getReadableRepositories();
    };

    $scope.getWritableRepositories = function () {
        return $repositories.getWritableRepositories();
    };

    $scope.getActiveRepository = function () {
        return $repositories.getActiveRepository();
    };

    $scope.canWriteRepoInLocation = function (repository) {
        return $jwtAuth.canWriteRepo(repository);
    };

    $scope.canWriteActiveRepo = function (noSystem) {
        const activeRepository = $repositories.getActiveRepositoryObject();
        if (activeRepository) {
            // If the parameter noSystem is true then we don't allow write access to the SYSTEM repository
            return $jwtAuth.canWriteRepo(activeRepository)
                && (activeRepository.id !== 'SYSTEM' || !noSystem);
        }
        return false;
    };

    $scope.getActiveRepositoryObject = function () {
        return $repositories.getActiveRepositoryObject();
    };

    $scope.getActiveRepositoryShortLocation = function () {
        const repo = $repositories.getActiveRepositoryObject();
        if (repo) {
            const location = repo.location;
            if (location) {
                return '@' + UriUtils.shortenIri(location);
            }
        }

        return '';
    };

    $scope.isActiveRepoOntopType = function () {
        return $repositories.isActiveRepoOntopType();
    }

    $scope.isActiveRepoFedXType = function () {
        return $repositories.isActiveRepoFedXType();
    }

    $scope.isLicenseValid = function() {
        return $licenseService.isLicenseValid();
    }

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
    $scope.setRestricted = function () {
        if ($scope.attrs) {
            $scope.isRestricted =
                $scope.attrs.hasOwnProperty('license') && !$licenseService.isLicenseValid() ||
                $scope.attrs.hasOwnProperty('write') && $scope.isSecurityEnabled() && !$scope.canWriteActiveRepo()||
                $scope.attrs.hasOwnProperty('ontop') && $scope.isActiveRepoOntopType() ||
                $scope.attrs.hasOwnProperty('fedx') && $scope.isActiveRepoFedXType();
        }
    };

    $scope.toHumanReadableType = function (type) {
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

    $scope.setRepository = function (repository) {
        $repositories.setRepository(repository);
    };

    function setPrincipal() {
        // Using $q.when to proper set values in view
        $q.when($jwtAuth.getPrincipal())
            .then((principal) => {
                $scope.principal = principal;
                $scope.isIgnoreSharedQueries = principal && principal.appSettings.IGNORE_SHARED_QUERIES;
            });
    }

    $scope.logout = function () {
        $jwtAuth.clearAuthentication();
        toastr.success('Signed out');
        if ($jwtAuth.freeAccess) {
            // if it's free access check if we still can access the current repo
            // if not, a new default repo will be set or the current repo will be unset
            $repositories.resetActiveRepository();
        } else if ($jwtAuth.isSecurityEnabled()) {
            // otherwise show login screen if security is on
            $rootScope.redirectToLogin();
        }
    };

    $scope.isAdmin = function () {
        return $scope.hasRole(UserRole.ROLE_ADMIN);
    };

    $scope.isUser = function () {
        return $scope.hasRole(UserRole.ROLE_USER);
    };

    $scope.hasRole = function (role) {
        if (!angular.isUndefined(role)) {
            return $jwtAuth.hasRole(role);
        }
        return true;
    };

    $scope.hasPermission = function () {
        return $rootScope.hasPermission();
    };

    $scope.canReadRepo = function (repo) {
        return $jwtAuth.canReadRepo(repo);
    };

    $scope.checkForWrite = function (role, repo) {
        return $jwtAuth.checkForWrite(role, repo);
    };

    $scope.setPopoverRepo = function (repository) {
        $scope.popoverRepo = repository;
    };

    $scope.isRepoActive = function (repository) {
        return $repositories.isRepoActive(repository);
    }

    $scope.getRepositorySize = function () {
        $scope.repositorySize = {};
        if ($scope.popoverRepo) {
            $scope.repositorySize.loading = true;
            RepositoriesRestService.getSize($scope.popoverRepo).then(function (res) {
                $scope.repositorySize = res.data;
            });
        }
    };

    $scope.getDegradedReason = function () {
        return $repositories.getDegradedReason();
    };

    $scope.canManageRepositories = function () {
        return $jwtAuth.hasRole(UserRole.ROLE_REPO_MANAGER) && !$repositories.getDegradedReason();
    };

    $scope.getSavedQueries = function () {
        SparqlRestService.getSavedQueries()
            .success(function (data) {
                $scope.sampleQueries = data;
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('query.editor.get.saved.queries.error'));
            });
    };

    $scope.goToSparqlEditor = function (query) {
        $location.path('/sparql').search({savedQueryName: query.name, owner: query.owner, execute: true});
    };

    $scope.declineTutorial = function () {
        $('.tutorial-container').slideUp("slow", function () {
            // Animation complete.
            LocalStorageAdapter.set(LSKeys.TUTORIAL_STATE, 1);
            $scope.tutorialState = false;
        });
    };

    $scope.initTutorial = function () {
        if (!$scope.tutorialState && $location.path() !== '/') {
            return;
        }
        $scope.tutorialInfo = [
            {
                "title": $translate.instant("main.info.title.welcome.page"),
                "info": decodeHTML($translate.instant('main.info.welcome.page'))
            },
            {
                "title": $translate.instant('main.info.title.create.repo.page'),
                "info": decodeHTML($translate.instant('main.info.create.repo.page', {link:"<a href=\"https://graphdb.ontotext.com/documentation/" + productInfo.productShortVersion + "/configuring-a-repository.html\" target=\"_blank\">"}))
            },
            {
                "title": $translate.instant('main.info.title.load.sample.dataset'),
                "info": $translate.instant('main.info.load.sample.dataset')
            },
            {
                "title": $translate.instant('main.info.title.run.sparql.query'),
                "info": decodeHTML($translate.instant('main.info.run.sparql.query'))
            },
            {
                "title": $translate.instant('menu.rest.api.label'),
                "info": decodeHTML($translate.instant('main.info.rest.api'))
            }
        ];
        $scope.activePage = 0;
        $(".pages-wrapper .page-slide").css("opacity", 100);
        const widthOfParentElm = $(".main-container")[0].offsetWidth + 200;
        $timeout(function () {
            const $pageSlider = $(".pages-wrapper .page-slide");
            $pageSlider.css("left", widthOfParentElm + "px");
            $($pageSlider[$scope.activePage]).css("left", 0 + "px");
            $($(".btn-toolbar.pull-right .btn-group .btn")[0]).focus();
        }, 50);
    };

    $scope.getTutorialPageHtml = function(page) {
        return $sce.trustAsHtml(page.info);
    };

    $scope.checkSubMenuPosition = function (index) {
        if (index === 0) {
            $('.main-menu.collapsed .sub-menu').removeClass('align-bottom');
        } else {
            if ($(window).height() < 735) {
                $('.main-menu.collapsed .sub-menu').addClass('align-bottom');
            } else {
                $('.main-menu.collapsed .sub-menu').removeClass('align-bottom');
            }
        }
    };

    collapsedMenuLogicOnInit();

    $(window).resize(function () {
        collapseMenuLogicOnResize();
        if ($scope.tutorialState && $location.path() === '/') {
            $scope.initTutorial();
        }
        if ($(window).height() < 735) {
            $('.sub-menu').addClass('align-bottom');
            $('.main-menu.collapsed li:nth-child(2) .sub-menu').removeClass('align-bottom');
        } else {
            $('.sub-menu').removeClass('align-bottom');
        }
    });

    function collapsedMenuLogicOnInit() {
        if ($(window).width() <= 720) {
            $('.container-fluid.main-container').addClass("expanded");
            $('.main-menu').addClass('collapsed');
            $('.main-menu .icon-caret-left').toggleClass('icon-caret-left').toggleClass('icon-caret-right');
            $('.toggle-menu').hide();
        } else if ($(window).width() > 720 && LocalStorageAdapter.get(LSKeys.MENU_STATE) === 'collapsedMenu') {
            $('.container-fluid.main-container').addClass("expanded");
            $('.main-menu').addClass('collapsed');
            $('.toggle-menu').show();
            $('.main-menu .icon-caret-left').toggleClass('icon-caret-left').toggleClass('icon-caret-right');
        } else {
            $('.container-fluid.main-container').removeClass("expanded");
            $('.main-menu').removeClass('collapsed');
            $('.toggle-menu').show();
            $('.main-menu .icon-caret-right').toggleClass('icon-caret-right').toggleClass('icon-caret-left');
        }
    }

    function collapseMenuLogicOnResize() {
        if (angular.isDefined($scope.menuState)) {
            if ($(window).width() <= 720) {
                $('.container-fluid.main-container').addClass("expanded");
                $('.main-menu').addClass('collapsed');
                $('.toggle-menu').hide();
                $('.main-menu .icon-caret-left').toggleClass('icon-caret-left').toggleClass('icon-caret-right');
            } else if ($(window).width() > 720 && $scope.menuState) {
                $('.toggle-menu').show();
            } else {
                $('.container-fluid.main-container').removeClass("expanded");
                $('.main-menu').removeClass('collapsed');
                $('.toggle-menu').show();
                $('.main-menu .icon-caret-right').toggleClass('icon-caret-right').toggleClass('icon-caret-left');
            }
        } else {
            collapsedMenuLogicOnInit();
        }
    }

    $scope.slideToPage = function (index) {
        const widthOfParentElm = $(".main-container")[0].offsetWidth;
        const $pageSlider = $(".pages-wrapper .page-slide");
        $pageSlider.css("opacity", "0").delay(200).css("left", widthOfParentElm + "px");
        $scope.activePage = index;
        $($pageSlider[$scope.activePage]).css("opacity", "100").css("left", 0 + "px");
    };

    $scope.slideNext = function () {
        let nextPageIndex = ++$scope.activePage;
        if (nextPageIndex >= $scope.tutorialInfo.length) {
            nextPageIndex = 0;
        }
        $scope.slideToPage(nextPageIndex);
        $($(".btn-toolbar.pull-right .btn-group .btn")[$scope.activePage]).focus();
    };

    $scope.toggleNavigation = function () {
        const $mainMenu = $('.main-menu');
        const $activeSubmenu = $('.sub-menu li.active');
        if (!$mainMenu.hasClass('collapsed')) {
            $activeSubmenu.parents('.menu-element').children('.menu-element-root').addClass('active');

            const $menuElement = $('.menu-element');
            if ($menuElement.hasClass('open')) {
                $menuElement.removeClass('open');
                $scope.clicked = false;
                $scope.selected = -1;
            }
            $('.container-fluid.main-container').addClass("expanded");
            $mainMenu.addClass("collapsed");
            $('.main-menu .icon-caret-left').toggleClass('icon-caret-left').toggleClass('icon-caret-right');
            $('.main-menu.collapsed .menu-element.clicked').removeClass('clicked');
            $rootScope.$broadcast("onToggleNavWidth", true);
        } else {
            if (!$activeSubmenu.parents('.menu-element').hasClass('open')) {
                $activeSubmenu.parents('.menu-element').children('.menu-element-root').addClass('active');
            } else {
                $activeSubmenu.parents('.menu-element').children('.menu-element-root').removeClass('active');
            }
            $('.container-fluid.main-container').removeClass("expanded");
            $mainMenu.removeClass("collapsed");
            $('.main-menu .icon-caret-right').toggleClass('icon-caret-right').toggleClass('icon-caret-left');
            $rootScope.$broadcast("onToggleNavWidth", false);
        }
    };

    $scope.$on('onToggleNavWidth', function (e, isCollapsed) {
        $scope.menuState = isCollapsed;
        if (isCollapsed) {
            LocalStorageAdapter.set(LSKeys.MENU_STATE, 'collapsedMenu');
        } else {
            LocalStorageAdapter.set(LSKeys.MENU_STATE, 'expandedMenu');
        }
        if ($scope.tutorialState && $location.path() === '/') {
            const withOfParentElm = $(".pages-wrapper")[0].offsetWidth + 200;
            $timeout(function () {
                const $pageSlider = $(".pages-wrapper .page-slide");
                $pageSlider.css("left", withOfParentElm + "px");
                $($pageSlider[$scope.activePage]).css("left", 0 + "px");
            }, 50);
        }
    });

    $scope.numberOfActiveImports = 0;

    // Flag that getNumberOfActiveImports() is running
    $scope.getNumberOfActiveImportsRunning = false;

    $scope.getNumberOfActiveImports = function () {
        if ($scope.getNumberOfActiveImportsRunning) {
            // Already running from previous call, skip this one.
            return;
        }

        if (!$scope.canWriteActiveRepo() || $scope.getActiveRepository() === 'SYSTEM') {
            return;
        }

        $scope.getNumberOfActiveImportsRunning = true;
        $http({
            method: 'GET',
            url: 'rest/repositories/' + $scope.getActiveRepository() + '/import/active',
            timeout: 10000
        }).success(function (data) {
            $scope.numberOfActiveImports = data;
        }).finally(function () {
            $scope.getNumberOfActiveImportsRunning = false;
        });
    };

    // Flag that getQueries() is running
    $scope.getQueriesRunning = false;
    $scope.skipGetQueriesTimes = 0;

    // Fibonacci sequence generator
    const fibo = (function () {
        let fibo1 = 0;
        let fibo2 = 1;

        return {
            next: function () {
                const next = fibo2;
                fibo2 = fibo1 + fibo2;
                fibo1 = next;
                return next;
            },

            reset: function () {
                fibo1 = 0;
                fibo2 = 1;
            }
        };
    }());

    $scope.getQueries = function () {
        if ($scope.getQueriesRunning) {
            // Already running from previous call, skip this one.
            return;
        }

        if ($scope.skipGetQueriesTimes > 0) {
            // Requested to skip this run, the number of skips is a Fibonacci sequence when errors
            // are consecutive
            $scope.skipGetQueriesTimes--;
            return;
        }

        if (!$repositories.getActiveRepository() || $repositories.getActiveRepository() === 'SYSTEM'
            // Don't call getQueries for Ontop type repository
            || $repositories.isActiveRepoOntopType() || !$scope.hasRole(UserRole.ROLE_USER)) {
            // No monitoring if no active repo, the active repo is the system repo or the current user
            // isn't a repo admin.
            $scope.queryCount = 0;
            return;
        }

        $scope.getQueriesRunning = true;
        MonitoringRestService.getQueryCount()
            .success(function (data) {
                $scope.queryCount = data;
                fibo.reset();
            })
            .error(function () {
                $scope.queryCount = 0;
                $scope.skipGetQueriesTimes = fibo.next();
            })
            .finally(function () {
                $scope.getQueriesRunning = false;
            });
    };

    const timer = $interval(function () {
        if (!$scope.getDegradedReason()) {
            $scope.getQueries();
            $scope.getNumberOfActiveImports();
        }
    }, 2000);

    $scope.$on("$destroy", function () {
        $interval.cancel(timer);
    });

    if ($jwtAuth.securityInitialized) {
        $scope.getSavedQueries();
    }

    $scope.$on('securityInit', function (scope, securityEnabled, userLoggedIn, freeAccess) {
        $scope.securityEnabled = securityEnabled;
        $scope.userLoggedIn = userLoggedIn;

        // Handles all cases of pages accessible without being logged and without having free access ON
        if (securityEnabled && !userLoggedIn && !freeAccess) {
            if ($location.path() !== '/login') {
                $rootScope.redirectToLogin();
            }
        } else {
            setPrincipal();
            $licenseService.checkLicenseStatus();
            $scope.getSavedQueries();
        }
    });


    $scope.isEnterprise = function () {
        return $scope.getProductType() === "enterprise";
    };

    $scope.isFreeEdition = function () {
        return $scope.getProductType() === "free";
    };

    $scope.checkEdition = function (editions) {
        if (editions == null) {
            return true;
        }
        return _.indexOf(editions, $scope.getProductType()) >= 0;
    };

    $scope.showLicense = function() {
        return $licenseService.showLicense;
    }

    $scope.getLicense = function() {
        return $licenseService.license;
    }

    $scope.isLicenseHardcoded = function() {
        return $licenseService.isLicenseHardcoded;
    }

    $scope.getProductType = function() {
        return $licenseService.productType;
    }

    $scope.getProductTypeHuman = function() {
        return $licenseService.productTypeHuman;
    }


    $scope.getHumanReadableSeconds = function (s, preciseSeconds) {
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
        let message = "";
        if (days) {
            message += days + "d ";
        }
        if (days || hours) {
            message += hours + "h ";
        }
        if (days || hours || minutes) {
            message += minutes + "m ";
        }
        message += seconds + "s";
        return message.replace(/( 0[a-z])+$/, "");
    };

    $scope.getHumanReadableTimestamp = function (time) {
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
                return $filter('date')(time, "'" + $translate.instant('timestamp.today.at') + "' HH:mm");
            } else if (delta < 86400) {
                // yesterday
                return $filter('date')(time, "'" + $translate.instant('timestamp.yesterday.at') + "' HH:mm");
            }
        }

        return $filter('date')(time, ("'" + $translate.instant('timestamp.on') + "' yyyy-MM-dd '" + $translate.instant('timestamp.at') + "' HH:mm"));
    };
}

repositorySizeCtrl.$inject = ['$scope', '$http', 'RepositoriesRestService'];

function repositorySizeCtrl($scope, $http, RepositoriesRestService) {
    $scope.getRepositorySize = function (repository) {
        RepositoriesRestService.getSize(repository).then(function (res) {
            $scope.size = res.data;
        });
    };
}
