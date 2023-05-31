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
    'graphdb.framework.utils.notifications'
])
    .controller('JdbcListCtrl', JdbcListCtrl)
    .controller('JdbcCreateCtrl', JdbcCreateCtrl);

JdbcListCtrl.$inject = ['$scope', '$repositories', 'JdbcRestService', 'toastr', 'ModalService', '$translate'];

function JdbcListCtrl($scope, $repositories, JdbcRestService, toastr, ModalService, $translate) {

    $scope.getSqlConfigurations = function () {
        // Only do this if there is an active repo that isn't an Ontop or FedX repo.
        // Ontop and FedX repos don't support JDBC.
        if ($repositories.getActiveRepository()
                && !$repositories.isActiveRepoOntopType()
                    && !$repositories.isActiveRepoFedXType()) {
            JdbcRestService.getJdbcConfigurations().success(function (data) {
                $scope.jdbcConfigurations = data;
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('jdbc.not.get.SQL.msg'));
            });
        } else {
            $scope.jdbcConfigurations = [];
        }
    };

    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function () {
        $scope.getSqlConfigurations();
    });

    $scope.deleteConfiguration = function (name) {
        ModalService.openSimpleModal({
            title: $translate.instant('common.warning'),
            message: $translate.instant('jdbc.delete.sql.table.warning.msg', {name: name}),
            warning: true
        }).result
            .then(function () {
                JdbcRestService.deleteJdbcConfiguration(name).success(function () {
                    $scope.getSqlConfigurations();
                }).error(function(e) {
                    toastr.error(getError(e), $translate.instant('jdbc.not.delete.sql.msg'));
                });
            });
    };
}

JdbcCreateCtrl.$inject = ['$scope', '$location', 'toastr', '$repositories', '$window', '$timeout', 'JdbcRestService', 'RDF4JRepositoriesRestService', 'SparqlRestService', 'ModalService', '$translate'];

function JdbcCreateCtrl($scope, $location, toastr, $repositories, $window, $timeout, JdbcRestService, RDF4JRepositoriesRestService, SparqlRestService, ModalService, $translate) {

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
    $scope.currentQuery = {};


    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $location.path('jdbc');
        }
    });

    let timer = null;
    $scope.goBack = function () {
        timer = $timeout(function () {
            $window.history.back();
        }, 1000);
    };

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
            if (!confirm($translate.instant('jdbc.warning.unsaved.changes'))) {
                event.preventDefault();
            } else {
                window.removeEventListener('beforeunload', showBeforeunloadMessage);
                locationChangeListener();
                $timeout.cancel(timer);
            }
        }
    }

    $scope.$on('$destroy', function (event) {
        window.removeEventListener('beforeunload', showBeforeunloadMessage);
        locationChangeListener();
        $timeout.cancel(timer);
    });

    const defaultTabConfig = {
        id: '1',
        name: '',
        query: 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
            '\n' +
            '# Selects two variables to use as columns\n' +
            'SELECT ?id ?label {\n' +
            '    ?id rdfs:label ?label\n' +
            '    # The following placeholder must be present in the query\n' +
            '    #!filter\n' +
            '}',
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
            // Hide YASR by default, show on success in callback when needed
            queryType: ''
        };
    };

    $scope.saveTab = function () {
    };

    // Called when user clicks on a sample query
    $scope.setQuery = function (query) {
        // Hack for YASQE bug
        window.editor.setValue(query ? query : ' ');
    };

    if ($scope.name) {
        getJdbcConfiguration($scope.name);
    } else {
        setQueryFromTabConfig();
    }

    // FIXME: this is copy-pasted in graphs-config.controller.js and query-editor.controller.js. Find a way to avoid duplications
    function getNamespaces() {
        // Signals the namespaces are to be fetched => loader will be shown
        setLoader(true, $translate.instant('common.refreshing.namespaces'), $translate.instant('common.extra.message'));
        RDF4JRepositoriesRestService.getRepositoryNamespaces($repositories.getActiveRepository())
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

        if (!$scope.canWriteActiveRepo()) {
            window.editor.options.readOnly = true;
        }
    }

    $scope.goToPage = function (page) {
        $scope.page = page;
        const columns = $scope.currentQuery.columns;
        if (page === 2 && (!columns || columns.length === 0) && hasValidQuery()) {
            $scope.getColumnsSuggestions();
        }
        resetYasqeYasr();
    };

    function getJdbcConfiguration(name) {
        JdbcRestService.getJdbcConfiguration(name).success(function (config) {
            defaultTabConfig.query = config.query;
            defaultTabConfig.name = config.name;
            defaultTabConfig.columns = config.columns;

            defaultTabConfig.isNewConfiguration = !config.name;

            setQueryFromTabConfig();
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, $translate.instant('jdbc.not.get.sql.msg2'));
        });
    }

    function setQueryFromTabConfig() {
        $scope.tabsData = $scope.tabs = [defaultTabConfig];
        $scope.currentQuery = angular.copy(defaultTabConfig);

        resetYasqeYasr();

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
    }

    $scope.save = function () {
        if (!validateDefinition()) {
            return;
        }

        if (!$scope.currentQuery.name) {
            toastr.error($translate.instant('jdbc.required.configuration.name'));
            return;
        }

        if ($scope.currentQuery.isNewConfiguration) {
            JdbcRestService.createNewJdbcConfiguration($scope.currentQuery).success(function () {
                $scope.currentQuery.isPristine = true;
                $scope.currentQuery.isNewConfiguration = false;
                toastr.success($translate.instant('jdbc.saved.configuration'));
                $scope.goBack();
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('jdbc.not.saved.configuration'));
            });
        } else {
            JdbcRestService.updateJdbcConfiguration($scope.currentQuery).success(function () {
                $scope.currentQuery.isPristine = true;
                $scope.currentQuery.isNewConfiguration = false;
                toastr.success($translate.instant('jdbc.configuration.updated'));
                $scope.goBack();
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('jdbc.not.saved.configuration'));
            });
        }
    };

    $scope.hasPrecision = function (columnType) {
        return columnType === 'iri' || columnType === 'string' || columnType === 'decimal';
    };

    $scope.containsColumnsWithPrecision = function (columns) {
        return columns && columns.some((el) => $scope.hasPrecision(el.column_type));
    };

    $scope.hasScale = function (columnType) {
        return columnType === 'decimal';
    };

    $scope.containsColumnsWithScale = function (columns) {
        return columns && columns.some((el) => $scope.hasScale(el.column_type));
    };

    $scope.isLiteral = function (columnType) {
        return columnType !== 'iri' && columnType !== 'unknown';
    };

    $scope.containsNonLiteralColumnsOnly = function (columns) {
        return columns && columns.every((el) => !$scope.isLiteral(el.column_type));
    };

    $scope.containsUnknownColumns = function () {
        return $scope.currentQuery.columns && $scope.currentQuery.columns
            .find((el) => el.column_type === 'unknown');
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
                toastr.error(msg, $translate.instant('common.add.known.prefixes.error'));
                return true;
            });
    }

    $('textarea').on('paste', function () {
        $timeout(function () {
            addKnownPrefixes();
        }, 0);
    });

    $scope.selectColumnType = function (columnName, prevColumnType) {
        const column = _.find($scope.currentQuery.columns, function (column) {
            return column.column_name === columnName;
        });

        if (column.column_type === 'Get suggestion...') {
            JdbcRestService.getColumnsTypeSuggestion($scope.currentQuery.query, [columnName]).success(function (columnSuggestion) {
                column.column_type = columnSuggestion[columnName].column_type;
                if (column.column_type === prevColumnType) {
                    toastr.info($translate.instant('jdbc.same.suggested.sql.type', {type: column.column_type}),
                        $translate.instant('jdbc.suggest.sql.type'), {allowHtml: true});
                } else {
                    toastr.success($translate.instant('jdbc.suggested.sql.type', {type: column.column_type}),
                        $translate.instant('jdbc.suggest.sql.type'), {allowHtml: true});
                }
                column.sparql_type = columnSuggestion[columnName].sparql_type;
            }).error(function(e) {
                toastr.error(getError(e), $translate.instant('jdbc.not.suggest.column.type'));
            });
        }
        $scope.setDirty();
    };

    $scope.getColumnsSuggestions = function () {
        if ($scope.currentQuery.columns && $scope.currentQuery.columns.length > 0) {
            ModalService.openSimpleModal({
                title: $translate.instant('common.warning'),
                message: $translate.instant('jdbc.warning.column.type.msg'),
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
        if (!validateQuery()) {
            return;
        }

        JdbcRestService.getColumnNames($scope.currentQuery.query).success(function (columns) {
            JdbcRestService.getColumnsTypeSuggestion($scope.currentQuery.query, columns).success(function (columnTypes) {
                const suggestedColumns = [];
                _.forEach(columns, function (columnName) {
                    suggestedColumns.push({
                        column_name: columnName,
                        column_type: columnTypes[columnName].column_type,
                        nullable: true,
                        sparql_type: columnTypes[columnName].sparql_type
                    });
                });
                $scope.currentQuery.columns = suggestedColumns;
                $scope.setDirty();
            }).error(function (e) {
                toastr.error(getError(e), $translate.instant('jdbc.not.suggest.column.types'));
            });
        }).error(function (e) {
            toastr.error(getError(e), $translate.instant('jdbc.not.suggest.column.names'));
        });
    }

    $scope.deleteColumn = function (columnName, index) {
        ModalService.openSimpleModal({
            title: $translate.instant('common.warning'),
            message: $translate.instant('jdbc.warning.delete.column.msg', {columnName: columnName}),
            warning: true
        }).result
            .then(function () {
                $scope.currentQuery.columns.splice(index, 1);
                $scope.setDirty();
            });
    };

    $scope.getPreview = function () {
        if (!validateDefinition()) {
            return;
        }

        $scope.executedQueryTab = $scope.currentQuery;

        if (!$scope.queryIsRunning) {
            $scope.currentQuery.outputType = 'table';
            $scope.resetCurrentTabConfig();

            setLoader(true, $translate.instant('jdbc.preview.first.rows', {name: $scope.name}),
                                                                        $translate.instant('common.extra.message'));

            const successCallback = function (data, textStatus, jqXhr) {
                setPreviewResult(data, jqXhr, textStatus);
                setLoader(false);
            };

            const failCallback = function (data) {
                setLoader(false);
                toastr.error(getError(data, 0, 100), $translate.instant('jdbc.not.show.preview'));
            };

            if ($scope.canWriteActiveRepo()) {
                const sqlView = JSON.stringify({
                    name: $scope.currentQuery.name,
                    query: $scope.currentQuery.query,
                    columns: $scope.currentQuery.columns || []
                });
                JdbcRestService.getNewSqlTablePreview(sqlView)
                    .then(successCallback).catch(failCallback);
            } else {
                JdbcRestService.getExistingSqlTablePreview($scope.currentQuery.name)
                    .then(successCallback).catch(failCallback);
            }
        }
    };

    $scope.setDirty = function () {
        $scope.currentQuery.isPristine = false;
    };

    $scope.getTypeLabel = function (type) {
        switch (type) {
            case 'iri':
                return 'VARCHAR: IRI';
            case 'string':
                return 'VARCHAR: String';
            default:
                return type.indexOf(' ') > 0 ? type : type.toUpperCase();
        }
    };

    function resetYasqeYasr() {
        if ($scope.page === 2) {
            $scope.viewMode = 'editor';
        } else {
            $scope.viewMode = 'none';
        }
    }

    function getCellContentSQL(yasr, plugin, bindings, sparqlVar, context) {
        let value = bindings[sparqlVar].value;
        value = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const entityHtml = "<p class='nonUri' style='border: none; background-color: transparent; padding: 0; margin: 0'>"
            + value + "</p>";
        return "<div class = 'literal-cell'>" + entityHtml + "</div>";
    }


    function setPreviewResult(data, jqXhr, textStatus) {
        if (!data.results || !data.results.bindings || !data.results.bindings.length) {
            // Hides YASR as it may contain previous results
            toastr.info($translate.instant('jdbc.table.definition'), $translate.instant('jdbc.preview.sql'));
        } else {
            // Custom content extractor that won't insert " in SQL values (since we treat them as fake literals)
            window.yasr.plugins.table.options.getCellContent = getCellContentSQL;

            // Set query type so YASR shows the results
            $scope.currentTabConfig.queryType = 'SELECT';
            window.yasr.setResponse(jqXhr, textStatus, null);
        }
    }

    function hasValidQuery() {
        return window.editor && window.editor.getQueryType() === 'SELECT';
    }

    function validateDefinition() {
        return validateQuery() && validateColumns();
    }

    function validateQuery() {
        if (!hasValidQuery()) {
            toastr.error($translate.instant('jdbc.warning.invalid.query'), $translate.instant('jdbc.invalid.query)'));
            return false;
        }

        return true;
    }

    function validateColumns() {
        if (!$scope.currentQuery.columns || !$scope.currentQuery.columns.length) {
            toastr.error($translate.instant('jdbc.warning.one.column.msg'), $translate.instant('jdbc.invalid.columns'));
            return false;
        }

        if ($scope.containsUnknownColumns()) {
            toastr.error($translate.instant('jdbc.warning.all.column.msg'), $translate.instant('jdbc.invalid.columns'));
            return false;
        }

        return true;
    }
}
