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

JdbcListCtrl.$inject = ['$scope', '$repositories', 'JdbcRestService', 'toastr', 'ModalService'];

function JdbcListCtrl($scope, $repositories, JdbcRestService, toastr, ModalService) {

    $scope.getSqlConfigurations = function () {
        // Don't try  to get Sql configurations if repository is of
        // type Ontop, because latter doesn't have data directory
        if ($repositories.isActiveRepoOntopType()) {
            return;
        }
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

    $scope.deleteConfiguration = function (name) {
        ModalService.openSimpleModal({
            title: 'Warning',
            message: 'Are you sure you want to delete the SQL table configuration ' + '\'' + name + '\'?',
            warning: true
        }).result
            .then(function () {
                JdbcRestService.deleteJdbcConfiguration(name).success(function () {
                    $scope.getSqlConfigurations();
                });

            });
    }

    // Check if warning message should be shown or removed on repository change
    const repoIsSetListener = $scope.$on('repositoryIsSet', function () {
        $scope.setRestricted();
    });

    window.addEventListener('beforeunload', removeRepoIsSetListener);

    function removeRepoIsSetListener() {
        repoIsSetListener();
        window.removeEventListener('beforeunload', removeRepoIsSetListener);
    }
}

JdbcCreateCtrl.$inject = ['$scope', '$location', 'toastr', '$repositories', '$window', '$timeout', 'JdbcRestService', 'RDF4JRepositoriesRestService', 'SparqlRestService', 'ModalService'];

function JdbcCreateCtrl($scope, $location, toastr, $repositories, $window, $timeout, JdbcRestService, RDF4JRepositoriesRestService, SparqlRestService, ModalService) {

    $scope.name = $location.search().name || '';
    $scope.getNamespaces = getNamespaces;
    $scope.setLoader = setLoader;
    $scope.addKnownPrefixes = addKnownPrefixes;
    $scope.page = 1;
    $scope.noPadding = {paddingRight: 0, paddingLeft: 0};
    $scope.sqlTypes = ['string', 'iri', 'boolean', 'byte', 'short', 'int', 'long', 'float', 'double', 'decimal', 'date', 'time', 'timestamp', 'Get suggestion...'];
    $scope.currentTabConfig = {};
    // This property is obligatory in order to show YASQUE and YASR properly
    $scope.orientationViewMode = true;


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

    window.addEventListener('beforeunload', showBeforeunloadMessage);

    function showBeforeunloadMessage(event) {
        if (!$scope.currentQuery.isPristine) {
            event.returnValue = true;
        }
    }

    function confirmExit(event) {
        if (!$scope.currentQuery.isPristine) {
            if (!confirm('You have unsaved changes. Are you sure that you want to exit?')) {
                event.preventDefault();
            } else {
                window.removeEventListener('beforeunload', showBeforeunloadMessage);
                locationChangeListener();
            }
        }
    }

    $scope.$on('$destroy', function (event) {
        window.removeEventListener('beforeunload', showBeforeunloadMessage);
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
            resultsCount: 0,
            // QueryType of currentTabConfig is needed for visualization of YASR.
            // If not set, YASR is hidden
            queryType: window.editor.getQueryType()
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
        const columns = $scope.currentQuery.columns;
        if (page === 2 && (!columns || columns.length === 0)) {
            $scope.getColumnsSuggestions();
        }
    };

    function getJdbcConfiguration(name) {
        JdbcRestService.getJdbcConfiguration(name).success(function (config) {
            defaultTabConfig.query = config.query;
            defaultTabConfig.name = config.name;
            defaultTabConfig.columns = config.columns;

            defaultTabConfig.isNewConfiguration = !config.name;

            $scope.tabsData = $scope.tabs = [defaultTabConfig];
            $scope.currentQuery = angular.copy(defaultTabConfig);
            // ViewMode should be set to "none" to be
            // displayed YASQUE and YASR at the same time
            $scope.viewMode = 'none';

            if (window.editor) {
                $scope.setQuery($scope.currentQuery.query);
                loadTab();
            }

            $scope.$watch(function () {
                return $scope.currentQuery.query;
            }, function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.setDirty();
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

        if ($scope.currentQuery.isPristine) {
            toastr.success('SQL table configuration saved');
            return;
        }

        if ($scope.currentQuery.isNewConfiguration) {
            JdbcRestService.createNewJdbcConfiguration($scope.currentQuery).success(function () {
                $scope.currentQuery.isPristine = true;
                $scope.currentQuery.isNewConfiguration = false;
                toastr.success('SQL table configuration saved');
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Could not save SQL table configuration');
            });
        } else {
            JdbcRestService.updateJdbcConfiguration($scope.currentQuery).success(function () {
                $scope.currentQuery.isPristine = true;
                $scope.currentQuery.isNewConfiguration = false;
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

    $scope.isIri = function (columnType) {
        return columnType === 'iri';
    };

    $scope.containsIriColumnsOnly = function (columns) {
        return columns && columns.every(el => $scope.isIri(el.column_type));
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

    $scope.selectColumnType = function (columnName) {
        const column = _.find($scope.currentQuery.columns, function (column) {
            return column.column_name === columnName;
        });

        if (column.column_type === 'Get suggestion...') {
            JdbcRestService.getColumnsTypeSuggestion($scope.currentQuery.query, [columnName]).success(function (columnSuggestion) {
                column.column_type = columnSuggestion[columnName].column_type;
                column.nullable = false;
                column.sparql_type = columnSuggestion[columnName].sparql_type;;
            });
        }
        $scope.setDirty();
    };

    $scope.getColumnsSuggestions = function () {
        if ($scope.currentQuery.columns && $scope.currentQuery.columns.length > 0) {
            ModalService.openSimpleModal({
                title: 'Warning',
                message: 'Are you sure you want to get suggestions for all columns? This action will overwrite all column type mappings!',
                warning: true
            }).result
                .then(function () {
                    getSuggestions();
                });
        } else {
            getSuggestions();
        }
    };

    function getSuggestions() {
        JdbcRestService.getColumnNames($scope.currentQuery.query).success(function (columns) {
            JdbcRestService.getColumnsTypeSuggestion($scope.currentQuery.query, columns).success(function (columnTypes) {
                let suggestedColumns = [];
                _.forEach(columnTypes, function (value, key) {
                    suggestedColumns.push({
                        column_name: key,
                        column_type: value.column_type,
                        nullable: false,
                        sparql_type: value.sparql_type
                    });
                });
                $scope.currentQuery.columns = suggestedColumns;
                $scope.setDirty();
            });
        });
    }

    $scope.deleteColumn = function (columnName, index) {
        ModalService.openSimpleModal({
            title: 'Warning',
            message: 'Are you sure you want to delete the column ' + '\'' + columnName + '\'?',
            warning: true
        }).result
            .then(function () {
                $scope.currentQuery.columns.splice(index, 1);
                $scope.setDirty();
            });
    };

    $scope.getPreview = function () {
        $scope.executedQueryTab = $scope.currentQuery;
        if (window.editor.getQueryType() !== 'SELECT') {
            toastr.error('JDBC works only with SELECT queries.');
            return;
        }
        if (!$scope.queryIsRunning) {
            $scope.currentQuery.outputType = 'table';
            $scope.resetCurrentTabConfig();

            setLoader(true, 'Preview of first 100 rows of table ' + $scope.name,
                'Normally this is a fast operation but it may take longer if a bigger repository needs to be initialised first.');
            if ($scope.currentQuery.isNewConfiguration) {
                const sqlView = JSON.stringify({
                    name: $scope.currentQuery.name,
                    query: $scope.currentQuery.query,
                    columns: $scope.currentQuery.columns || []
                })
                JdbcRestService.getNewSqlTablePreview(sqlView)
                    .done(function (data, textStatus, jqXhr) {
                        setLoader(false);
                        window.yasr.setResponse(jqXhr, textStatus, null);
                    }).fail(function (data) {
                    setLoader(false);
                    toastr.error('Could not show preview ' + getError(data));
                });
            } else {
                JdbcRestService.getExistingSqlTablePreview($scope.currentQuery.name)
                    .done(function (data, textStatus, jqXhr) {
                        setLoader(false);
                        window.yasr.setResponse(jqXhr, textStatus, null);
                    }).fail(function (data) {
                    setLoader(false);
                    toastr.error('Could not show preview ' + getError(data));
                });
            }
        }
    };

    $scope.setDirty = function () {
        $scope.currentQuery.isPristine = false;
    };
}
