import 'angular/core/services';
import 'angular/core/services/repositories.service';
import 'angular/rest/monitoring.rest.service';
import 'angular/utils/notifications';


const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.rest.monitoring.service',
    'toastr'
];

angular.module('graphdb.framework.jdbc.controllers', modules, [
    'graphdb.framework.utils.notifications',
])
    .controller('JdbcListCtrl', JdbcListCtrl)
    .controller('JdbcCreateCtrl', JdbcCreateCtrl);

JdbcListCtrl.$inject = ['$scope', '$repositories', 'JdbcRestService', 'toastr'];

function JdbcListCtrl($scope, $repositories, JdbcRestService, toastr) {

    $scope.getSqlConfigurations = function () {
        JdbcRestService.getJdbcConfigurations().success(function (data) {
            $scope.jdbcConfigurations = data;
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, 'Could not get SQL table configurations');
        });
    };

    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function () {
        $scope.getSqlConfigurations();
    });
}

JdbcCreateCtrl.$inject = ['$scope', '$location', 'toastr', '$repositories', '$window', '$timeout', 'JdbcRestService', 'RDF4JRepositoriesRestService', 'SparqlRestService'];

function JdbcCreateCtrl($scope, $location, toastr, $repositories, $window, $timeout, JdbcRestService, RDF4JRepositoriesRestService, SparqlRestService) {

    $scope.name = $location.search().name || '';
    $scope.getNamespaces = getNamespaces;
    $scope.setLoader = setLoader;
    $scope.addKnownPrefixes = addKnownPrefixes;
    $scope.page = 1;
    $scope.noPadding = {paddingRight: 0, paddingLeft: 0};
    $scope.sqlTypes = ['string', 'iri', 'boolean', 'byte', 'short', 'int', 'long', 'float', 'double', 'decimal', 'date', 'time', 'timestamp'];
    $scope.currentTabConfig = {};


    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $location.path('jdbc');
        }
    });

    const locationChangeListener = $scope.$on('$locationChangeStart', function (event) {
        confirmExit(event);
    });

    window.addEventListener('beforeunload', function (event) {
        event.returnValue =  true;
    });

    function confirmExit(event) {
        if (!$scope.currentQuery.isPristine) {
            if (!confirm('You have unsaved changes. Are you sure, you want to exit?')) {
                event.preventDefault();
            }
        }
    }

    $scope.$on('$destroy', function (event) {
        window.removeEventListener('beforeunload');
        locationChangeListener();
    });

    const defaultTabConfig = {
        id: '1',
        name: '',
        query: '',
        inference: true,
        sameAs: true,
        isNewConfiguration: true,
        isPristine: true
    };

    $scope.resetCurrentTabConfig = function () {
        $scope.currentTabConfig = {
            pageSize: 100, // page limit 100 as this is only used for preview
            page: 1,
            allResultsCount: 0,
            resultsCount: 0
        };
    };

    $scope.saveTab = function () {
    };

    // Called when user clicks on a sample query
    $scope.setQuery = function (query) {
        // Hack for YASQE bug
        window.editor.setValue(query ? query : ' ');
    };

    getJdbcConfiguration($scope.name);

    // FIXME: this is copy-pasted in graphs-config.controller.js and query-editor.controller.js. Find a way to avoid duplications
    function getNamespaces() {
        // Signals the namespaces are to be fetched => loader will be shown
        setLoader(true, 'Refreshing namespaces', 'Normally this is a fast operation but it may take longer if a bigger repository needs to be initialised first.');
        RDF4JRepositoriesRestService.getRepositoryNamespaces()
            .success(function (data) {
                const usedPrefixes = {};
                data.results.bindings.forEach(function (e) {
                    usedPrefixes[e.prefix.value] = e.namespace.value;
                });
                $scope.namespaces = usedPrefixes;
            })
            .error(function (data) {
                $scope.repositoryError = getError(data);
            })
            .finally(function () {
                // Signals namespaces were fetched => loader will be hidden
                setLoader(false);
                loadTab();
            });
    }

    function setLoader(isRunning, progressMessage, extraMessage) {
        const yasrInnerContainer = angular.element(document.getElementById('yasr-inner'));
        $scope.queryIsRunning = isRunning;
        if (isRunning) {
            $scope.queryStartTime = Date.now();
            $scope.countTimeouted = false;
            $scope.progressMessage = progressMessage;
            $scope.extraMessage = extraMessage;
            yasrInnerContainer.addClass('hide');
        } else {
            $scope.progressMessage = '';
            $scope.extraMessage = '';
            yasrInnerContainer.removeClass('hide');
        }

        // We might call this from angular or outside angular so take care of applying the scope.
        if ($scope.$$phase === null) {
            $scope.$apply();
        }
    }

    function loadTab() {
        $scope.tabsData = [$scope.currentQuery];

        const tab = $scope.currentQuery;

        if (!$scope.currentQuery.query) {
            // hack for YASQE bug
            window.editor.setValue(' ');
        } else {
            window.editor.setValue($scope.currentQuery.query);
        }

        $timeout(function () {
            $scope.currentTabConfig = {};
            $scope.currentTabConfig.queryType = tab.queryType;
            $scope.currentTabConfig.resultsCount = tab.resultsCount;

            $scope.currentTabConfig.offset = tab.offset;
            $scope.currentTabConfig.allResultsCount = tab.allResultsCount;
            $scope.currentTabConfig.page = tab.page;
            $scope.currentTabConfig.pageSize = tab.pageSize;

            $scope.currentTabConfig.timeFinished = tab.timeFinished;
            $scope.currentTabConfig.timeTook = tab.timeTook;
            $scope.currentTabConfig.sizeDelta = tab.sizeDelta;
            $scope.$apply();
        }, 0);

    };

    $scope.goToPage = function (page) {
        $scope.page = page;
    };

    function getJdbcConfiguration(name) {
        JdbcRestService.getJdbcConfiguration(name).success(function (config) {
            defaultTabConfig.query = config.query;
            defaultTabConfig.name = config.name;
            defaultTabConfig.columns = config.columns;

            defaultTabConfig.isNewConfiguration = !config.name;

            $scope.tabsData = $scope.tabs = [defaultTabConfig];
            $scope.currentQuery = angular.copy(defaultTabConfig);
            $scope.viewMode = 'yasr';

            if (window.editor) {
                $scope.setQuery($scope.currentQuery.query);
                loadTab();
            }

            $scope.$watch(function () {
                return $scope.currentQuery.query;
            }, function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.currentQuery.isPristine = false;
                }
            });

        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, 'Could not get SQL table configuration');
        });
    }

    $scope.save = function () {
        if ($scope.currentQuery.queryType !== 'SELECT') {
            toastr.error('Sparql query must be SELECT');
            return;
        }

        if (!$scope.currentQuery.name) {
            toastr.error('SQL configuration name is required');
            return;
        }

        if ($scope.currentQuery.isNewConfiguration) {
            JdbcRestService.createNewJdbcConfiguration($scope.currentQuery).success(function () {
                toastr.success('SQL table configuration saved');
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Could not save SQL table configuration');
            });
        } else {
            JdbcRestService.updateJdbcConfiguration($scope.currentQuery).success(function () {
                toastr.success('SQL table configuration updated');
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Could not save SQL table configuration');
            });
        }
    };

    $scope.hasPrecision = function (columnType) {
        return columnType === 'iri' || columnType === 'string' || columnType === 'decimal';
    };

    $scope.containsColumnsWithPrecision = function (columns) {
        return columns && columns.some(el => $scope.hasPrecision(el.column_type));
    };

    $scope.hasScale = function (columnType) {
        return columnType === 'decimal';
    };

    $scope.containsColumnsWithScale = function (columns) {
        return columns && columns.some(el => $scope.hasScale(el.column_type));
    };

    // Add known prefixes
    function addKnownPrefixes() {
        SparqlRestService.addKnownPrefixes(JSON.stringify(window.editor.getValue()))
            .success(function (data) {
                if (angular.isDefined(window.editor) && angular.isDefined(data) && data !== window.editor.getValue()) {
                    window.editor.setValue(data);
                }
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error! Could not add known prefixes');
                return true;
            });
    }

    $('textarea').on('paste', function () {
        $timeout(function () {
            addKnownPrefixes();
        }, 0);
    });
}
