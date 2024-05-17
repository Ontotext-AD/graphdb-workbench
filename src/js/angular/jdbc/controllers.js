import 'angular/core/services/repositories.service';
import 'angular/rest/monitoring.rest.service';
import 'angular/utils/notifications';
import 'angular/core/services';
import 'angular/core/directives/core-error/core-error.directive';
import {JdbcConfigurationInfo} from "../models/jdbc/jdbc-configuration-info";
import {YasqeMode} from "../models/ontotext-yasgui/yasqe-mode";
import {JdbcConfigurationError} from "../models/jdbc/jdbc-configuration-error";
import {RenderingMode} from "../models/ontotext-yasgui/rendering-mode";
import {toJDBCColumns, updateColumn} from "../models/jdbc/jdbc-column";
import {DISABLE_YASQE_BUTTONS_CONFIGURATION, YasguiComponentDirectiveUtil} from "../core/directives/yasgui-component/yasgui-component-directive.util";
import {decodeHTML} from "../../../app";

const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.rest.monitoring.service',
    'toastr',
    'graphdb.framework.core.directives.core-error'
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
                }).error(function (e) {
                    toastr.error(getError(e), $translate.instant('jdbc.not.delete.sql.msg'));
                });
            });
    };
}

JdbcCreateCtrl.$inject = [
    '$q',
    '$scope',
    '$rootScope',
    '$location',
    'toastr',
    '$repositories',
    '$window',
    '$timeout',
    '$interval',
    'JdbcRestService',
    'RDF4JRepositoriesRestService',
    'SparqlRestService',
    'ModalService',
    '$translate',
    '$languageService',
    'GlobalEmitterBuss'];

function JdbcCreateCtrl(
    $q,
    $scope,
    $rootScope,
    $location,
    toastr,
    $repositories,
    $window,
    $timeout,
    $interval,
    JdbcRestService,
    RDF4JRepositoriesRestService,
    SparqlRestService,
    ModalService,
    $translate,
    $languageService,
    GlobalEmitterBuss) {

    $scope.emptySparqlResponse = "{\"head\": {\"vars\": []},\"results\": {\"bindings\": []}}";
    $scope.getSuggestionSqlType = '';
    $scope.sqlTypes = [];
    $scope.activeTab = 1;
    $scope.jdbcConfigurationInfo = new JdbcConfigurationInfo();
    $scope.jdbcConfigurationInfo.jdbcConfigurationName = $location.search().name || '';
    $scope.saveOrUpdateExecuted = false;
    $scope.jdbcConfigurationInfo.isNewJdbcConfiguration = !$scope.jdbcConfigurationInfo.jdbcConfigurationName;
    $scope.language = $languageService.getLanguage();
    $scope.isDirty = false;
    $scope.prefixes = [];
    $scope.loadingControllerResources = false;
    $scope.isQueryRunning = false;
    $scope.canEditActiveRepo = false;

    // This flag is used to prevent loading of the yasgui on consecutive repository change events after
    // the first.
    let initialRepoInitialization = true;

    // =========================
    // Public functions
    // =========================

    $scope.saveJdbcConfiguration = () => {
        $scope.saveOrUpdateExecuted = true;

        if (!$scope.jdbcConfigurationInfo.jdbcConfigurationName) {
            return;
        }

        if (!$scope.isDirty) {
            goToJdbcView();
            return;
        }

        const saveOrUpdate = $scope.jdbcConfigurationInfo.isNewJdbcConfiguration ? createConfiguration : updateConfiguration;

        validateQueryType($scope.jdbcConfigurationInfo)
            .then(validateQuery)
            .then(validateColumns)
            .then(updateJdbcConfigurationQuery)
            .then(saveOrUpdate)
            .catch((error) => {
                if (!(error instanceof JdbcConfigurationError)) {
                    const msg = getError(error);
                    toastr.error(msg, $translate.instant('jdbc.not.saved.configuration'));
                }
            });
    };

    $scope.getPreview = () => {
        $scope.activeTab = 1;

        $scope.isQueryRunning = true;
        validateQueryType($scope.jdbcConfigurationInfo)
            .then(validateQuery)
            .then(validateColumns)
            .then(updateJdbcConfigurationQuery)
            .then((jdbcConfigurationInfo) => {
                updateYasguiConfiguration({render: RenderingMode.YASQE, initialQuery: jdbcConfigurationInfo.query});
                return jdbcConfigurationInfo;
            })
            .then(getSqlTablePreview)
            .then(([tablePreviewResults, jdbcConfigurationInfo]) => {
                const hasResult = tablePreviewResults && tablePreviewResults.results.bindings && tablePreviewResults.results.bindings.length > 0;
                let render = RenderingMode.YASGUI;
                if (!hasResult) {
                    render = RenderingMode.YASQE;
                    toastr.info($translate.instant('jdbc.table.definition'), $translate.instant('jdbc.preview.sql'));
                }
                updateYasguiConfiguration({
                    render,
                    sparqlResponse: tablePreviewResults,
                    initialQuery: jdbcConfigurationInfo.query
                });
            })
            .catch((error) => {
                if (!(error instanceof JdbcConfigurationError)) {
                    toastr.error(getError(error, 0, 100), $translate.instant('jdbc.not.show.preview'));
                } else {
                    if (error.jdbcConfigurationInfo && (error.jdbcConfigurationInfo.isColumnsEmpty || error.jdbcConfigurationInfo.hasUndefinedColumns)) {
                        getSuggestions();
                        $scope.activeTab = 2;
                    }
                }
            })
            .finally(() => {
                $scope.isQueryRunning = false;
            });
    };

    $scope.setActiveTab = (tabIndex) => {
        $scope.activeTab = tabIndex;
        const columns = $scope.jdbcConfigurationInfo.columns;
        if ($scope.activeTab === 2 && (!columns || columns.length === 0)) {
            validateQueryType($scope.jdbcConfigurationInfo)
                .then(validateQuery)
                .then(() => {
                    $scope.getColumnsSuggestions();
                });
        }
    };

    $scope.setDirty = () => {
        $scope.isDirty = true;
    };

    $scope.getTypeLabel = (type) => {
        switch (type) {
            case 'iri':
                return 'VARCHAR: IRI';
            case 'string':
                return 'VARCHAR: String';
            default:
                return type.indexOf(' ') > 0 ? type : type.toUpperCase();
        }
    };

    $scope.selectColumnType = (columnName, prevColumnType) => {
        $scope.setDirty();
        const column = $scope.jdbcConfigurationInfo.columns.find((column) => column.column_name === columnName);

        if (column.column_type === $scope.getSuggestionSqlType) {
            updateJdbcConfigurationQuery($scope.jdbcConfigurationInfo)
                .then((jdbcConfigurationInfo) => JdbcRestService.getColumnsTypeSuggestion(jdbcConfigurationInfo.query, [columnName]))
                .then((response) => response.data)
                .then((columnSuggestion) => {
                    updateColumn(column, columnSuggestion);
                    notifyColumnTypeChanged(column.column_type, prevColumnType);
                })
                .catch((error) => {
                    toastr.error(getError(error), $translate.instant('jdbc.not.suggest.column.type'));
                });
        }
    };

    $scope.deleteColumn = function (columnName, index) {
        ModalService.openSimpleModal({
            title: $translate.instant('common.warning'),
            message: $translate.instant('jdbc.warning.delete.column.msg', {columnName: columnName}),
            warning: true
        }).result
            .then(function () {
                $scope.jdbcConfigurationInfo.columns.splice(index, 1);
                $scope.setDirty();
            });
    };

    $scope.getColumnsSuggestions = () => {
        if ($scope.jdbcConfigurationInfo.columns && $scope.jdbcConfigurationInfo.columns.length > 0) {
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

    $scope.hasPrecision = (columnType) => {
        return columnType === 'iri' || columnType === 'string' || columnType === 'decimal';
    };

    $scope.containsColumnsWithPrecision = (columns) => {
        return columns && columns.some((el) => $scope.hasPrecision(el.column_type));
    };

    $scope.containsColumnsWithScale = (columns) => {
        return columns && columns.some((el) => hasScale(el.column_type));
    };

    $scope.isLiteral = (columnType) => {
        return columnType !== 'iri' && columnType !== 'unknown';
    };

    $scope.containsNonLiteralColumnsOnly = (columns) => {
        return columns && columns.every((el) => !$scope.isLiteral(el.column_type));
    };

    // =========================
    // Private functions
    // =========================

    const getSqlTablePreview = (jdbcConfigurationInfo) => {
        if ($scope.canWriteActiveRepo) {
            const sqlView = JSON.stringify({
                name: $scope.jdbcConfigurationInfo.jdbcConfigurationName,
                query: $scope.jdbcConfigurationInfo.query,
                columns: $scope.jdbcConfigurationInfo.columns || []
            });
            return Promise.all([JdbcRestService.getNewSqlTablePreview(sqlView).then((response) => response.data), Promise.resolve(jdbcConfigurationInfo)]);
        } else {
            return Promise.all([JdbcRestService.getExistingSqlTablePreview($scope.jdbcConfigurationInfo.jdbcConfigurationName).then((response) => response.data), Promise.resolve(jdbcConfigurationInfo)]);
        }
    };

    const notifyColumnTypeChanged = (currentColumnType, prevColumnType) => {
        if (currentColumnType === prevColumnType) {
            toastr.info(decodeHTML($translate.instant('jdbc.same.suggested.sql.type', {type: currentColumnType})),
                $translate.instant('jdbc.suggest.sql.type'), {allowHtml: true});
        } else {
            toastr.success(decodeHTML($translate.instant('jdbc.suggested.sql.type', {type: currentColumnType})),
                $translate.instant('jdbc.suggest.sql.type'), {allowHtml: true});
        }
    };

    const init = (prefixes, jdbcConfiguration = new JdbcConfigurationInfo()) => {
        $scope.jdbcConfigurationInfo.columns = jdbcConfiguration.columns;
        $scope.jdbcConfigurationInfo.query = jdbcConfiguration.query;
        $scope.jdbcConfigurationInfo.jdbcConfigurationName = $location.search().name || '';
        $scope.jdbcConfigurationInfo.isNewJdbcConfiguration = !$scope.jdbcConfigurationInfo.jdbcConfigurationName;
        $scope.prefixes = prefixes;
        updateYasguiConfiguration();
        updateSqlTypes();
    };

    const createConfiguration = (jdbcConfigurationInfo) => {
        const configuration = {
            name: jdbcConfigurationInfo.jdbcConfigurationName,
            query: jdbcConfigurationInfo.query,
            columns: jdbcConfigurationInfo.columns
        };

        return JdbcRestService.createNewJdbcConfiguration(configuration)
            .then(() => {
                $scope.isDirty = false;
                $scope.jdbcConfigurationInfo.isNewConfiguration = false;
                toastr.success($translate.instant('jdbc.saved.configuration'));
                goBack();
            });
    };

    const updateConfiguration = (jdbcConfigurationInfo) => {
        const configuration = {
            name: jdbcConfigurationInfo.jdbcConfigurationName,
            query: jdbcConfigurationInfo.query,
            columns: jdbcConfigurationInfo.columns
        };
        JdbcRestService.updateJdbcConfiguration(configuration)
            .then(() => {
                $scope.isDirty = false;
                $scope.jdbcConfigurationInfo.isNewConfiguration = false;
                toastr.success($translate.instant('jdbc.configuration.updated'));
                goBack();
            });
    };


    const updateYasguiConfiguration = (additionalConfiguration = {}) => {
        const config = {};
        angular.extend(config, $scope.yasguiConfig || getDefaultYasguiConfiguration(), additionalConfiguration);
        $scope.yasguiConfig = config;
    };

    const getDefaultYasguiConfiguration = () => {
        return {
            showEditorTabs: false,
            showToolbar: false,
            showResultTabs: false,
            showQueryButton: false,
            showResultInfo: false,
            downloadAsOn: false,
            showYasqeResizer: false,
            initialQuery: $scope.jdbcConfigurationInfo.query,
            componentId: 'jdbc-component',
            prefixes: $scope.prefixes,
            maxPersistentResponseSize: 0,
            render: RenderingMode.YASQE,
            getCellContent: getCellContent,
            sparqlResponse: $scope.emptySparqlResponse,
            yasqeActionButtons: DISABLE_YASQE_BUTTONS_CONFIGURATION,
            yasqeMode: $scope.canEditActiveRepo ? YasqeMode.WRITE : YasqeMode.PROTECTED
        };
    };

    /**
     * Checks if query mode is valid. The mode have to be "select".
     * @param {JdbcConfigurationInfo} jdbcConfiguration - holds information about jdbc configuration.
     * @return {Promise<JdbcConfigurationInfo>}
     */
    const validateQueryType = (jdbcConfiguration) => {
        return getOntotextYasgui().getQueryType()
            .then((queryType) => {
                jdbcConfiguration.isValidQueryType = 'SELECT' === queryType;
                if (!jdbcConfiguration.isValidQueryType) {
                    return Promise.reject(new JdbcConfigurationError('Query type is not valid.'));
                }
                return jdbcConfiguration;
            });
    };

    /**
     * Checks if query is valid.
     * @param {JdbcConfigurationInfo} jdbcConfigurationInfo - holds information about jdbc configuration.
     * @return {Promise<JdbcConfigurationInfo>}
     */
    const validateQuery = (jdbcConfigurationInfo) => {
        return getOntotextYasgui().isQueryValid()
            .then((valid) => {
                jdbcConfigurationInfo.isValidQuery = valid;
                if (!jdbcConfigurationInfo.isValidQuery) {
                    return Promise.reject(new JdbcConfigurationError('Invalid query.'));
                }
                return jdbcConfigurationInfo;
            });
    };

    /**
     * Checks if jdbc configuration has columns without defined type.
     * @param {JdbcConfigurationInfo} jdbcConfiguration - holds information about jdbc configuration.
     * @return {Promise<JdbcConfigurationInfo>}
     */
    const validateColumns = (jdbcConfiguration) => {
        if (!jdbcConfiguration.columns || jdbcConfiguration.columns.length === 0) {
            jdbcConfiguration.isColumnsEmpty = true;
            toastr.error($translate.instant('jdbc.warning.one.column.msg'));
            return Promise.reject(new JdbcConfigurationError('There are not defined columns.', jdbcConfiguration));
        }
        const unknownColumn = $scope.jdbcConfigurationInfo.columns && $scope.jdbcConfigurationInfo.columns
            .find((el) => el.column_type === 'unknown');
        if (unknownColumn) {
            jdbcConfiguration.hasUndefinedColumns = true;
            return Promise.reject(new JdbcConfigurationError('There are columns without defined type.', jdbcConfiguration));
        }
        return Promise.resolve(jdbcConfiguration);
    };

    const getSuggestions = () => {
        validateQueryType($scope.jdbcConfigurationInfo)
            .then(validateQuery)
            .then(updateJdbcConfigurationQuery)
            .then(getColumnNames)
            .then(getColumnsTypeSuggestion)
            .then((jdbcConfigurationInfo) => $scope.jdbcConfigurationInfo = jdbcConfigurationInfo)
            .catch((error) => {
                console.log(error);
            });
    };

    const getColumnNames = (jdbcConfigurationInfo) => {
        return JdbcRestService.getColumnNames(jdbcConfigurationInfo.query)
            .then((response) => [jdbcConfigurationInfo, response.data])
            .catch(function (e) {
                toastr.error(getError(e), $translate.instant('jdbc.not.suggest.column.names'));
            });
    };

    const getColumnsTypeSuggestion = ([jdbcConfigurationInfo, columns]) => {
        return JdbcRestService.getColumnsTypeSuggestion(jdbcConfigurationInfo.query, columns)
            .then(function (response) {
                jdbcConfigurationInfo.columns = toJDBCColumns(columns, response.data);
                jdbcConfigurationInfo.isColumnsEmpty = jdbcConfigurationInfo.columns.length;
                $scope.setDirty();
                return jdbcConfigurationInfo;
            }).catch(function (e) {
                toastr.error(getError(e), $translate.instant('jdbc.not.suggest.column.types'));
            });
    };

    const getOntotextYasgui = () => {
        return YasguiComponentDirectiveUtil.getOntotextYasguiElement('#query-editor');
    };

    const updateJdbcConfigurationQuery = (jdbcConfigurationInfo) => {
        return getOntotextYasgui().getQuery()
            .then((query) => {
                jdbcConfigurationInfo.query = query;
                return jdbcConfigurationInfo;
            });
    };

    const hasScale = (columnType) => {
        return columnType === 'decimal';
    };

    const getCellContent = (bindings, _prefixes) => {
        let value = bindings.value;
        value = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const entityHtml = "<p class='nonUri' style='border: none; background-color: transparent; padding: 0; margin: 0'>"
            + value + "</p>";
        return "<div class = 'literal-cell'>" + entityHtml + "</div>";
    };

    const openConfirmDialog = (title, message, onConfirm, onCancel) => {
        ModalService.openSimpleModal({
            title,
            message,
            warning: true
        }).result.then(function () {
            if (angular.isFunction(onConfirm)) {
                onConfirm();
            }
        }, function () {
            if (angular.isFunction(onCancel)) {
                onCancel();
            }
        });
    };

    /**
     * Starts loading of needed data and process the view.
     */
    const loadOntotextYasgui = () => {
        $scope.loadingControllerResources = true;
        const activeRepository = $repositories.getActiveRepository();
        if ($scope.jdbcConfigurationInfo.jdbcConfigurationName) {
            Promise.all([$repositories.getPrefixes(activeRepository), JdbcRestService.getJdbcConfiguration($scope.jdbcConfigurationInfo.jdbcConfigurationName)])
                .then(([prefixes, templateContent]) => {
                    init(prefixes, templateContent.data);
                })
                .finally(() => $scope.loadingControllerResources = false);
        } else {
            $repositories.getPrefixes(activeRepository)
                .then((prefixes) => init(prefixes))
                .finally(() => $scope.loadingControllerResources = false);
        }
    };

    /**
     * Translates "Get suggestion..." sql type option and updates sql type options with it.
     */
    const updateSqlTypes = () => {
        $scope.getSuggestionSqlType = $translate.instant('view.jdbc.create.get_suggestion_sql_type');
        $scope.sqlTypes = ['string', 'iri', 'boolean', 'byte', 'short', 'int', 'long', 'float', 'double', 'decimal', 'date', 'time', 'timestamp', $scope.getSuggestionSqlType];
    };

    /**
     * go to jdbc configurations page.
     */
    const goBack = () => {
        // Added timeout a success message to be shown.
        setTimeout(function () {
            goToJdbcView();
        }, 1000);
    };

    const goToJdbcView = () => {
        $location.url('/jdbc');
    };

    // =========================
    // Subscriptions handlers
    // =========================
    const languageChangedHandler = () => {
        $scope.language = $languageService.getLanguage();
        updateSqlTypes();
    };

    const repositoryWillChangedHandler = (eventData) => {
        return new Promise(function (resolve) {

            if ($scope.jdbcConfigurationInfo.isNewJdbcConfiguration) {
                resolve(eventData);
                return;
            }

            const onConfirm = () => {
                $scope.isDirty = false;
                goToJdbcView();
                resolve(eventData);
            };

            if ($scope.isDirty) {
                const onCancel = () => {
                    eventData.cancel = true;
                    resolve(eventData);
                };
                const title = $translate.instant('common.confirm');
                const message = $translate.instant('jdbc.warning.unsaved.changes');
                openConfirmDialog(title, message, onConfirm, onCancel);
            } else {
                onConfirm();
            }
        });
    };

    const locationChangedHandler = (event, newPath) => {
        if ($scope.isDirty) {
            event.preventDefault();
            const title = $translate.instant('common.confirm');
            const message = $translate.instant('jdbc.warning.unsaved.changes');
            const onConfirm = () => {
                removeAllListeners();
                const baseLen = $location.absUrl().length - $location.url().length;
                const path = newPath.substring(baseLen);
                $location.path(path);
            };
            openConfirmDialog(title, message, onConfirm);
        } else {
            removeAllListeners();
        }
    };

    const beforeunloadHandler = (event) => {
        if ($scope.isDirty) {
            event.returnValue = true;
        }
    };

    const removeAllListeners = () => {
        window.removeEventListener('beforeunload', beforeunloadHandler);
        subscriptions.forEach((subscription) => subscription());
    };

    const repositoryChangedHandler = (activeRepo) => {
        if (activeRepo) {
            $scope.canEditActiveRepo = $scope.canWriteActiveRepo();
            if (initialRepoInitialization) {
                loadOntotextYasgui();
                initialRepoInitialization = false;
            } else {
                getOntotextYasgui().abortQuery().then(goToJdbcView);
            }
        }
    };

    // =========================
    // Subscriptions
    // =========================
    const subscriptions = [];

    subscriptions.push($rootScope.$on('$translateChangeSuccess', languageChangedHandler));
    subscriptions.push($scope.$on('$locationChangeStart', locationChangedHandler));
    subscriptions.push(GlobalEmitterBuss.subscribe('repositoryWillChangeEvent', repositoryWillChangedHandler));
    subscriptions.push($scope.$on('$destroy', removeAllListeners));
    // Prevent go out of the current page? check
    window.addEventListener('beforeunload', beforeunloadHandler);


    // Wait until the active repository object is set, otherwise "canWriteActiveRepo()" may return a wrong result and the "ontotext-yasgui"
    // readOnly configuration may be incorrect.
    subscriptions.push($scope.$watch($scope.getActiveRepositoryObject, repositoryChangedHandler));
}
