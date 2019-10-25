import 'angular/core/services';
import 'angular/rest/sparql.rest.service';
import 'angular/rest/autocomplete.rest.service';
import 'angular/rest/monitoring.rest.service';
import 'angular/rest/license.rest.service';
import 'angular/rest/repositories.rest.service';
import 'angular/rest/rdf4j.repositories.rest.service';
import 'ng-file-upload/dist/ng-file-upload.min';
import 'ng-file-upload/dist/ng-file-upload-shim.min';
import 'angular/security/services';
import 'angular/core/services/repositories.service';

angular
    .module('graphdb.workbench.se.controllers', [
        'graphdb.framework.security.services',
        'graphdb.framework.core.services.repositories',
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
        'graphdb.framework.rest.monitoring.service',
        'graphdb.framework.rest.rdf4j.repositories.service'
    ])
    .controller('mainCtrl', mainCtrl)
    .controller('homeCtrl', homeCtrl)
    .controller('repositorySizeCtrl', repositorySizeCtrl);

homeCtrl.$inject = ['$scope', '$http', '$repositories', 'AutocompleteRestService', 'LicenseRestService', 'RepositoriesRestService', 'RDF4JRepositoriesRestService'];

function homeCtrl($scope, $http, $repositories, AutocompleteRestService, LicenseRestService, RepositoriesRestService, RDF4JRepositoriesRestService) {
    LicenseRestService.getHardcodedLicense()
        .success(function (res) {
            $scope.isLicenseHardcoded = (res === 'true');
        })
        .error(function () {
            $scope.isLicenseHardcoded = true;
        })
        .then(function () {
            LicenseRestService.getLicenseInfo().then(function (res) {
                $scope.license = res.data;
            }, function () {
                $scope.license = {message: 'No license was set.', valid: false};
            });
        });

    $scope.getActiveRepositorySize = function () {
        const repo = $repositories.getActiveRepository();
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

    $scope.$watch($scope.getActiveRepository, function () {
        if (angular.isDefined($scope.getActiveRepository()) && $scope.getActiveRepository() !== '') {
            $scope.getNamespacesPromise = RDF4JRepositoriesRestService.getNamespaces($scope.getActiveRepository())
                .success(function () {
                    $scope.getAutocompletePromise = AutocompleteRestService.checkAutocompleteStatus()
                        .success(function () {
                            $scope.getActiveRepositorySize();
                        });
                });
        }
    });
}

mainCtrl.$inject = ['$scope', '$menuItems', '$jwtAuth', '$http', '$cookies', 'toastr', '$location', '$repositories', '$rootScope', 'localStorageService', 'productInfo', '$timeout', 'ModalService', '$interval', '$filter', 'LicenseRestService', 'RepositoriesRestService', 'MonitoringRestService', 'SparqlRestService', '$sce'];

function mainCtrl($scope, $menuItems, $jwtAuth, $http, $cookies, toastr, $location, $repositories, $rootScope, localStorageService, productInfo, $timeout, ModalService, $interval, $filter, LicenseRestService, RepositoriesRestService, MonitoringRestService, SparqlRestService, $sce) {
    $scope.mainTitle = 'GraphDB';
    $scope.descr = 'An application for searching, exploring and managing GraphDB semantic repositories.';
    $scope.productTypeHuman = '';
    $scope.documentation = '';
    $scope.menu = $menuItems;
    $scope.tutorialState = localStorageService.get('tutorial-state') !== 1;
    $scope.showLicense = false;
    $scope.userLoggedIn = false;
    $scope.embedded = $location.search().embedded;
    $scope.productInfo = productInfo;

    const setYears = function () {
        const date = new Date();
        $scope.currentYear = date.getFullYear();
        $scope.previousYear = 2002; // Peio says this is 2002 or 2003, in other words the year of the earliest file.
    };

    setYears();

    $scope.$on("$routeChangeSuccess", function () {
        $scope.clicked = false;
        $('.menu-element-root').removeClass('active');
        $timeout(function () {
            $('.menu-element.open a.menu-element-root').addClass('active');
            $('.main-menu.collapsed .menu-element.open .menu-element-root').addClass('active');
        }, 400);
        $scope.checkLicenseStatus();
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

    $scope.goToEditRepo = function (repoName) {
        $location.path('repository/edit/' + repoName).search({previous: 'home'});
    };

    $scope.$on("$locationChangeSuccess", function () {
        $scope.showFooter = $location.url() === '/';
    });

    $scope.$on("repositoryIsSet", function () {
        angular.forEach(localStorageService.keys(), function (key) {
            // remove everything but the hide prefixes setting, it should always persist
            if (key.indexOf("classHierarchy-") === 0 && key !== "classHierarchy-hidePrefixes") {
                localStorageService.remove(key);
            }
        });
    });

    $scope.graphdbVersion =
        $scope.engineVersion =
            $scope.workbenchVersion = productInfo.productVersion;

    $scope.connectorsVersion = productInfo.connectors;

    $scope.sesameVersion = productInfo.sesame;

    $scope.productType = productInfo.productType;
    if ($scope.productType === "standard") {
        $scope.productTypeHuman = "Standard";
        $scope.documentation = "standard/";
    } else if ($scope.productType === "enterprise") {
        $scope.productTypeHuman = "Enterprise";
        $scope.documentation = "enterprise/";
    } else if ($scope.productType === "free") {
        $scope.productTypeHuman = "Free";
        $scope.documentation = "free/";
    }
    $scope.mainTitle = $scope.productTypeHuman;

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
    $scope.isDefaultAuthEnabled = function () {
        return $jwtAuth.isDefaultAuthEnabled();
    };
    $scope.isS4 = function () {
        return $scope.license && $scope.license.version === "S4";
    };

    $scope.isUserLoggedIn = function () {
        return $scope.userLoggedIn;
    };

    $scope.getLocations = function () {
        return $repositories.getLocations();
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

    $scope.canWriteRepoInActiveLocation = function (repository) {
        return $jwtAuth.canWriteRepo($repositories.getActiveLocation(), repository);
    };

    $scope.canWriteActiveRepo = function (noSystem) {
        const activeRepository = $repositories.getActiveRepository();
        // If the parameter noSystem is true then we don't allow write access to the SYSTEM repository
        return $jwtAuth.canWriteRepo($repositories.getActiveLocation(), activeRepository)
            && (activeRepository !== 'SYSTEM' || !noSystem);
    };

    $scope.getActiveRepositoryObject = function () {
        return _.find($scope.getRepositories(), function (repo) {
            return repo.id === $scope.getActiveRepository();
        });
    };

    $scope.toHumanReadableType = function (type) {
        switch (type) {
            case 'worker':
                return 'EE Worker';
            case 'master':
                return 'EE Master';
            case 'se':
                return 'Standard';
            case 'free':
                return 'Free';
            case 'system':
                return 'System';
            default:
                return 'Unknown';
        }
    };

    $scope.setRepository = function (id) {
        $repositories.setRepository(id);
    };

    $scope.principal = function () {
        return $jwtAuth.getPrincipal();
    };

    $scope.isIgnoreSharedQueries = function () {
        return $jwtAuth.getPrincipal().appSettings.IGNORE_SHARED_QUERIES;
    };

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
    $scope.hasRole = function (role) {
        if (!angular.isUndefined(role)) {
            return $jwtAuth.hasRole(role);
        }
        return true;
    };

    $scope.hasPermission = function () {
        return $rootScope.hasPermission();
    };

    $scope.canReadRepo = function (location, repo) {
        return $jwtAuth.canReadRepo(location, repo);
    };

    $scope.checkForWrite = function (role, location, repo) {
        return $jwtAuth.checkForWrite(role, location, repo);
    };

    $scope.setPopoverRepo = function (repository) {
        $scope.popoverRepo = repository;
    };

    $scope.getRepositorySize = function () {
        $scope.repositorySize = {};
        if ($scope.popoverRepo) {
            $scope.repositorySize.loading = true;
            RepositoriesRestService.getSize($scope.popoverRepo.id).then(function (res) {
                $scope.repositorySize = res.data;
            });
        }
    };

    $scope.getDegradedReason = function () {
        return $repositories.getDegradedReason();
    };

    $scope.canManageRepositories = function () {
        return $jwtAuth.hasRole('ROLE_REPO_MANAGER') && !$repositories.getDegradedReason();
    };

    $scope.getSavedQueries = function () {
        SparqlRestService.getSavedQueries()
            .success(function (data) {
                $scope.sampleQueries = data;
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error! Could not get saved queries');
            });
    };

    $scope.goToSparqlEditor = function (query) {
        $location.path('/sparql').search({savedQueryName: query.name, owner: query.owner, execute: true});
    };

    $scope.declineTutorial = function () {
        $('.tutorial-container').slideUp("slow", function () {
            // Animation complete.
            localStorageService.set("tutorial-state", 1);
            $scope.tutorialState = false;
        });
    };

    $scope.initTutorial = function () {
        if (!$scope.tutorialState && $location.path() !== '/') {
            return;
        }
        $scope.tutorialInfo = [
            {
                "title": "Welcome to GraphDB",
                "info": "GraphDB is a graph database compliant with RDF and SPARQL specifications. " +
                "It supports open APIs based on RDF4J (ex-Sesame) project and enables fast publishing of linked data on the web. " +
                "The Workbench is used for searching, exploring and managing GraphDB semantic repositories. " +
                "This quick tutorial will guide you through the basics: <br>" +
                "<ul>" +
                "<li>(1) Create a repository</li>" +
                "<li>(2) Load a sample dataset</li>" +
                "<li>(3) Run a SPARQL query</li>" +
                "</ul>" +
                "You can always come back to this tutorial by pressing the GraphDB icon in the top left corner."
            },
            {
                "title": "Create a repository",
                "info": "Now let’s create your first repository. Go to Setup > Repositories and press Create new repository button. " +
                "Fill the field Repository ID and press enter. The default repository parameters are optimized for datasets up to 100 million " +
                "RDF statements. If you plan to load more check for more information: " +
                "<a href=\"http://graphdb.ontotext.com/documentation/" + $scope.productType + "/configuring-a-repository.html\" target=\"_blank\">Configuring a repository</a>"
            },
            {
                "title": "Load a sample dataset",
                "info": "GraphDB includes a sample dataset in the distribution under the directory examples/data/news. " +
                "The dataset represents new articles semantically enriched with structured information from Wikipedia. " +
                "To load the data go to Import > RDF and select the local files. "
            },
            {
                "title": "Run a SPARQL query",
                "info": "You can find a list of sample SPARQL queries under examples/data/news/queries.txt demonstrating how to find " +
                "interesting searches of news articles and the mentioned entities like: <br>" +
                "<ul>" +
                "<li>(1) Give me articles about persons born in New York</li>" +
                "<li>(2) Show me all occupations of every person in the news</li>" +
                "<li>(3) List me the members of a specific political party</li>" +
                "</ul>"
            },
            {
                "title": "REST API",
                "info": "GraphDB allows you to perform every operation also via a REST API or by using language specific RDF4J client application. " +
                "To see the full list of supported functionality go to Help > REST API or check the sample code under examples/developer-getting-started/\n" +
                "Have fun!"
            }
        ];
        $scope.activePage = 0;
        $(".pages-wrapper .page-slide").css("opacity", 100);
        const withOfParentElm = $(".pages-wrapper")[0].offsetWidth + 200;
        $timeout(function () {
            const $pageSlider = $(".pages-wrapper .page-slide");
            $pageSlider.css("left", withOfParentElm + "px");
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
        } else if ($(window).width() > 720 && localStorageService.get('menu-state') === 'collapsedMenu') {
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
        const withOfParentElm = $(".pages-wrapper")[0].offsetWidth;
        const $pageSlider = $(".pages-wrapper .page-slide");
        $pageSlider.css("opacity", "0").delay(200).css("left", withOfParentElm + "px");
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
            localStorageService.set("menu-state", 'collapsedMenu');
        } else {
            localStorageService.set("menu-state", 'expandedMenu');
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
            url: 'rest/data/import/active/' + $scope.getActiveRepository(),
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
            || !$scope.hasRole('ROLE_REPO_MANAGER')) {
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

    $scope.$on('securityInit', function (scope, securityEnabled, userLoggedIn, freeAccess) {
        $scope.securityEnabled = securityEnabled;
        $scope.userLoggedIn = userLoggedIn;

        // Handles all cases of pages accessible without being logged and without having free access ON
        if (securityEnabled && !userLoggedIn && !freeAccess) {
            if ($location.path() !== '/login') {
                $rootScope.redirectToLogin();
            }
        }
    });

    $scope.checkLicenseStatus = function () {
        LicenseRestService.getHardcodedLicense().success(function (res) {
            $scope.isLicenseHardcoded = (res === 'true');
        }).error(function () {
            $scope.isLicenseHardcoded = true;
        }).then(function () {
            LicenseRestService.getLicenseInfo().then(function (res) {
                $scope.license = res.data;
                $scope.showLicense = true;
            }, function () {
                $scope.license = {message: 'No license was set.', valid: false};
                $scope.showLicense = true;
            });
        });
    };

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
            return "moments ago";
        } else if (delta < 600) {
            return "minutes ago";
        } else {
            const dNow = new Date(now);
            const dTime = new Date(time);
            if (dNow.getYear() === dTime.getYear() && dNow.getMonth() === dTime.getMonth() && dNow.getDate() === dTime.getDate()) {
                // today
                return $filter('date')(time, "'today at' HH:mm");
            } else if (delta < 86400) {
                // yesterday
                return $filter('date')(time, "'yesterday at' HH:mm");
            }
        }

        return $filter('date')(time, "'on' yyyy-MM-dd 'at' HH:mm");
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
