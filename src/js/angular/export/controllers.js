import 'angular/core/services';
import 'angular/core/services/repositories.service';
import 'angular/core/services/jwt-auth.service';
import 'angular/utils/file-types';
import 'angular/rest/export.rest.service';
import {saveAs} from 'lib/FileSaver-patch';
import {decodeHTML} from "../../../app";
import {cloneDeep} from "lodash";
import {ExportSettingsCtrl} from "../core/components/export-settings-modal/controller";

const modules = [
    'ngCookies',
    'ui.bootstrap',
    'toastr',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.core.services.jwtauth',
    'graphdb.workbench.utils.filetypes',
    'graphdb.framework.rest.export.service'
];

const exportCtrl = angular.module('graphdb.framework.impex.export.controllers', modules);

exportCtrl.controller('ExportCtrl',
  ['$scope', '$http', '$location', '$timeout', 'ModalService', 'filterFilter', '$repositories', 'toastr', 'ExportRestService', 'RDF4JRepositoriesRestService',
      'FileTypes', '$translate', 'AuthTokenService', '$uibModal',
      function($scope, $http, $location, $timeout, ModalService, filterFilter, $repositories, toastr, ExportRestService, RDF4JRepositoriesRestService,
        FileTypes, $translate, AuthTokenService, $uibModal) {

            $scope.getActiveRepository = function () {
                return $repositories.getActiveRepository();
            };

            $scope.exportFormats = FileTypes;
            $scope.deleting = {};
            $scope.showExportDDTooltip = true;
            $scope.page = 1;
            $scope.pageSize = 10;
            $scope.pageSizeOptions = [10, 20, 50, 100];
            $scope.displayGraphs = [];
            $scope.exportFilter = '';
            $scope.export = true;
            $scope.exportMultipleGraphs = false;
            $scope.repoExportFormat = {
                name: 'TriG',
                type: 'application/x-trig',
                extension: '.trig'
            };
            $scope.selectedGraphs = {
                exportGraphs: {}
            };

            $scope.$watch(function () {
                return $repositories.getActiveRepository();
            }, function () {
                $scope.exportFilter = '';
                $scope.getGraphs();
                $scope.selectedAll = false;
                $timeout(function () {
                    $scope.changePageSize(10);
                }, 100);
            });

            $scope.isShacl = function (iri) {
                return iri === "http%3A%2F%2Frdf4j.org%2Fschema%2Frdf4j%23SHACLShapeGraph";
            };

            /// <summary>Get Graphs that are part of the Active Repository.</summary>
            $scope.getGraphs = function () {
                if ($scope.getActiveRepository()) {
                    $scope.loader = true;
                    RDF4JRepositoriesRestService.getGraphs($scope.getActiveRepository()).success(function (data) {
                        data.results.bindings.unshift({
                            contextID: {
                                type: 'default',
                                value: 'import.default.graph'
                            }
                        });
                        $scope.graphsByValue = {};
                        Object.keys(data.results.bindings).forEach(function (key) {
                            const binding = data.results.bindings[key];
                            if (binding.contextID.type === 'bnode') {
                                binding.contextID.value = '_:' + binding.contextID.value;
                            } else if (binding.contextID.type === 'default') {
                                binding.contextID.uri = encodeURIComponent('http://www.openrdf.org/schema/sesame#nil');
                                binding.contextID.clearUri = 'DEFAULT';
                                binding.contextID.exportUri = 'null';
                                binding.contextID.longName = 'default graph';
                            } else {
                                binding.contextID.uri = encodeURIComponent(binding.contextID.value);
                                binding.contextID.clearUri = 'GRAPH <' + binding.contextID.value + '>';
                                binding.contextID.exportUri = encodeURIComponent('<' + binding.contextID.value + '>');
                                binding.contextID.longName = 'named graph ' + binding.contextID.value;
                            }
                            $scope.graphsByValue[binding.contextID.value] = binding.contextID;
                        });
                        $scope.graphs = data.results.bindings;
                        $scope.filteredGraphs = cloneDeep($scope.graphs);
                        $scope.displayGraphs = $scope.filteredGraphs.slice($scope.pageSize * ($scope.page - 1), $scope.pageSize * $scope.page);
                        $scope.loader = false;
                        $scope.selectedGraphs.exportGraphs = {};
                        $scope.matchedElements = $scope.graphs;
                    }).error(function (data, status) {
                        const msg = getError(data, status);
                        if (msg === 'There is no active location!') {
                            $repositories.setRepository('');
                            toastr.error(msg, $translate.instant('common.error'));
                        }
                        $scope.loader = false;
                    });
                } else {
                    $scope.loader = false;
                }
            };

            $scope.onGraphSearch = function () {
                $scope.matchedElements = [];
                $scope.deselectAll();
                $scope.filterResults();
            };

            $scope.filterResults = function () {
                angular.forEach($scope.graphs, function (item) {
                    if (item.contextID.value.indexOf($scope.exportFilter) !== -1) {
                        $scope.matchedElements.push(item);
                    }
                });
            };

            $scope.downloadExport = function (downloadUrl, format) {
                let url = downloadUrl + '&Accept=' + encodeURIComponent(format.type);
                const auth = AuthTokenService.getAuthToken();
                if (auth) {
                    url = url + '&authToken=' + encodeURIComponent(auth);
                }
                let win = window.open(url);
                $timeout(function () {
                    if (win.document.location.href !== 'about:blank') {
                        win.close();
                        toastr.error('Could not export graph. Check GraphDB logs for detailed reason.');
                    }
                }, 100);

            };

            /*
             *
             * @method downloadJSONLDExport
             * @param {String} data format
             * @param [String] array of string contexts if multiple graphs were selected or single graph object
             * @param {String} context/frame link
             * @param {Object} current repository
             * @param {Object} graphsByValue
             * @param {Object} JSONLDMode (name and mode link)
             */
            function downloadJSONLDExport(format, context, link, repo, graphsByValue, JSONLDMode) {
                const acceptHeader = format.type + ';profile=' + JSONLDMode.link;
                const headers = {
                    'accept': acceptHeader,
                    'link': link
                };
                ExportRestService.getExportedStatementsAsJSONLD(context, repo, graphsByValue, AuthTokenService.getAuthToken(), headers)
                    .then(function ({data, filename}) {
                        saveAs(data, filename);
                    })
                    .catch(function (res) {
                        // data is received as blob
                        res.data.text()
                            .then((message) => {
                                if (res.status === 431) {
                                    toastr.error(res.statusText, $translate.instant('common.error'));
                                } else {
                                    toastr.error(message, $translate.instant('common.error'));
                                }
                            });
                    });
            }

            /// <summary>Trigger the custom event for DD tooltip.</summary>
            $scope.openExportDDTooltip = function () {
                if ($scope.showExportDDTooltip) {
                    $timeout(function () {
                        $('#tooltipTarget').trigger('showExportDDTooltip');
                    }, 0);
                    $timeout(function () {
                        $('#tooltipTarget').trigger('showExportDDTooltip');
                    }, 3000);

                    //Set to false so the tooltip shows only once
                    $scope.showExportDDTooltip = false;

                }
            };

            /// <summary>Fill the hidden form and submit it to start download document.</summary>
            $scope.exportRepo = function (format, contextID) {
                if (format.type === 'application/rdf+xml' || format.type === 'text/plain' || format.type === 'text/turtle' || format.type === 'application/x-turtlestar' || format.type === 'text/rdf+n3') {
                    ModalService.openSimpleModal({
                        title: $translate.instant('common.warning'),
                        message: decodeHTML($translate.instant('export.format.warning.msg')),
                        warning: true
                    }).result
                        .then(function () {
                            $scope.startDownload(format, contextID);
                        });
                } else {
                    $scope.startDownload(format, contextID);
                }
            };

            /*
             * Open a dialog with additional export settings for JSONLD format.
             *
             * @method openJSONLDExportSettings
             * @param {String} data format
             * @param {String} string context if there is any (or string from multiple contexts if there are multiple selected graphs for export)
             * @param {Boolean} true if the method is invoked for multiple selected graphs export
             */
            $scope.openJSONLDExportSettings = function (format, context) {
                const modalInstance = $uibModal.open({
                    templateUrl: 'js/angular/core/components/export-settings-modal/exportSettingsModal.html',
                    controller: ExportSettingsCtrl,
                    size: 'lg',
                    scope: $scope,
                    resolve: {
                        format: function () {
                            return format.name;
                        }
                    }
                });

                modalInstance.result.then(function (data) {
                    const linkHeader = data.link ? '<' + data.link + '>' : '';
                    downloadJSONLDExport(format, context, linkHeader, $repositories.getActiveRepositoryObject(), $scope.graphsByValue, data.currentMode);
                });
            };

            $scope.startDownload = function (format, contextID) {
                //If it's graph set the url for ?context=
                let downloadUrl;
                const repo = $repositories.getActiveRepositoryObject();
                if (contextID) {
                    downloadUrl = `repositories/${repo.id}/statements?infer=false&context=${$scope.graphsByValue[contextID.value].exportUri}&location=${encodeURIComponent(repo.location)}`;
                } else {
                    downloadUrl = `repositories/${repo.id}/statements?infer=false&location=${encodeURIComponent(repo.location)}`;
                }
                $scope.downloadExport(downloadUrl, format);
            };

            $scope.hasMultipleSelected = function () {
                if (_.isEmpty($scope.selectedGraphs.exportGraphs)) {
                    return !_.isEmpty($scope.selectedGraphs.exportGraphs);
                } else {
                    for (const index in $scope.selectedGraphs.exportGraphs) {
                        if ($scope.selectedGraphs.exportGraphs[index] === true) {
                            return true;
                        }
                    }
                    return false;
                }
            };

            $scope.openJSONLDExportSettingsForSelectedGraphs = function (format) {
                const contextsArray = Object.keys($scope.selectedGraphs.exportGraphs)
                    .map((index) => $scope.graphsByValue[index].exportUri);

                if (contextsArray) {
                    $scope.openJSONLDExportSettings(format, contextsArray);
                } else {
                      ModalService.openSimpleModal({
                          title: $translate.instant('export.multiple.graph'),
                          message: $translate.instant('export.check.graphs.msg'),
                          warning: true
                      });
                }
            };

            $scope.exportSelectedGraphs = function (format) {
                let contextStr = '';
                for (const index in $scope.selectedGraphs.exportGraphs) {
                    if ($scope.selectedGraphs.exportGraphs[index]) {
                        contextStr += 'context=' + $scope.graphsByValue[index].exportUri + '&';
                    }
                }

                if (contextStr) {
                    const startDownload = function () {
                        contextStr = contextStr.substring(0, contextStr.length - 1);
                        const downloadUrl = 'repositories/' + $scope.getActiveRepository() + '/statements?infer=false&' + contextStr;
                        $scope.downloadExport(downloadUrl, format);
                    };

                    if (format.type === 'application/rdf+xml' || format.type === 'text/plain' || format.type === 'text/turtle' || format.type === 'application/x-turtlestar' || format.type === 'text/rdf+n3') {
                        ModalService.openSimpleModal({
                            title: $translate.instant('common.warning'),
                            message: decodeHTML($translate.instant('export.format.warning.msg')),
                            warning: true
                        }).result
                            .then(function () {
                                startDownload();
                            });
                    } else {
                        startDownload();
                    }
                } else {
                    ModalService.openSimpleModal({
                        title: $translate.instant('export.multiple.graph'),
                        message: $translate.instant('export.check.graphs.msg'),
                        warning: true
                    });
                }
            };

            $scope.$watch('exportFilter', function () {
                $scope.filteredGraphs = filterFilter($scope.graphs, $scope.exportFilter);
                if ($scope.getActiveRepository() && angular.element(document).find('.btn.btn-secondary.btn-sm.dropdown-toggle span').length) {
                    const valueOfFilteredGraphsButton = angular.element(document).find('.btn.btn-secondary.btn-sm.dropdown-toggle span')[0].innerHTML.trim();
                    let valueOfFilteredGraphs;
                    if (valueOfFilteredGraphsButton === 'All') {
                        valueOfFilteredGraphs = $scope.filteredGraphs.length;
                    }
                    if ($scope.filteredGraphs && $scope.filteredGraphs.length > $scope.pageSize && valueOfFilteredGraphsButton !== 'All') {
                        valueOfFilteredGraphs = $scope.pageSize;
                    }
                    $scope.changePageSize(valueOfFilteredGraphs);
                    $scope.changePagination();
                }
            });

            $scope.changePagination = function () {
                $scope.selectedAll = false;
                if (angular.isDefined($scope.filteredGraphs)) {
                    $scope.displayGraphs = $scope.filteredGraphs.slice($scope.pageSize * ($scope.page - 1), $scope.pageSize * $scope.page);
                }
            };

            $scope.changePageSize = function (size) {
                $('.ot-graph-page-size').removeClass('active');
                $scope.page = 1;
                if (size) {
                    $scope.pageSize = size;
                    $scope.changePagination();
                }
                if ($scope.filteredGraphs && $scope.exportFilter !== '') {
                    $scope.displayGraphs = $scope.filteredGraphs;
                }
            };

            $scope.checkAll = function () {
                $scope.selectedAll = $scope.selectedAll || false;

                angular.forEach($scope.displayGraphs, function (item) {
                    if (item.contextID.uri) {
                        $scope.selectedGraphs.exportGraphs[item.contextID.value] = $scope.selectedAll;
                    }
                });
            };

            $scope.deselectAll = function () {
                $scope.selectedAll = false;
                angular.forEach($scope.displayGraphs, function (item) {
                    if (item.contextID.uri) {
                        $scope.selectedGraphs.exportGraphs[item.contextID.value] = false;
                    }
                });
            };

            $scope.dropRepository = function () {
                if (!$scope.canWriteActiveRepo()) {
                    return;
                }
                $scope.deleting['*'] = true;

                ModalService.openSimpleModal({
                    title: $translate.instant('export.confirm.clear.msg'),
                    message: $translate.instant('export.warning.clear.repo.msg', {repo: $repositories.getActiveRepository()}),
                    warning: true
                }).result
                    .then(function () {
                        $timeout(function () {
                            RDF4JRepositoriesRestService.addStatements($repositories.getActiveRepository(), 'update=CLEAR ALL')
                                .then(function () {
                                    $scope.deleting['*'] = false;
                                    toastr.success($translate.instant('export.cleared.repo', {repo: $repositories.getActiveRepository()}));
                                    $scope.getGraphs();
                                }, function (err) {
                                    $scope.deleting['*'] = false;
                                    const errMsg = err.data;
                                    if (typeof errMsg == "string" && errMsg.indexOf("Clearing all statements in the " +
                                        "repository is incompatible with collecting history") > -1) {
                                        toastr.error($translate.instant('export.clearing.statements.warning'));
                                    } else {
                                        toastr.error($translate.instant('export.cleared.repo.failed.msg', {repo: $repositories.getActiveRepository()}), err);
                                    }
                                });
                        }, 100);
                    });
            };

            function dropGraph(ctx) {
                const longName = ctx.contextID.longName;
                $scope.deleting[ctx] = true;
                ModalService.openSimpleModal({
                    title: $translate.instant('export.confirm.clear.graph'),
                    message: $translate.instant('export.clear.graph.warning', {longName: longName}),
                    warning: true
                }).result
                    .then(function () {
                        $timeout(function () {
                            const data = `update=CLEAR ${ctx.contextID.clearUri}`;
                            RDF4JRepositoriesRestService.addStatements($repositories.getActiveRepository(), data)
                                .then(function () {
                                    $scope.deleting[ctx] = false;
                                    toastr.success($translate.instant('export.cleared.graph', {longName: longName}));
                                    $scope.getGraphs();
                                    $scope.exportFilter = '';
                                    $scope.filteredGraphs.length = 0;
                                    $scope.updateResults();
                                    $scope.changePageSize($scope.pageSize);
                                }, function (err) {
                                    $scope.deleting[ctx] = false;
                                    toastr.error($translate.instant('export.clear.graph.msg', {longName: longName}), getError(err, err.status));
                                });
                        }, 100);
                    }, function () {
                        $scope.deleting[ctx] = false;
                    });
            }

            function dropSelectedGraphs(ctx) {
                const selectedGraphsForDelete = [];
                angular.forEach($scope.selectedGraphs.exportGraphs, function (value, key) {
                    if (value) {
                        selectedGraphsForDelete.push(key);
                    }
                });

                if (selectedGraphsForDelete.length > 0) {
                    $scope.deleting[ctx] = true;
                    ModalService.openSimpleModal({
                        title: $translate.instant('export.confirm.clear.graph'),
                        message: $translate.instant('export.warning.clear.graph.msg'),
                        warning: true
                    }).result.then(function () {
                        $timeout(function () {
                            let counterOfClearedGraphs = 0;
                            angular.forEach(selectedGraphsForDelete, function (contextID) {
                                const data = `update=CLEAR ${$scope.graphsByValue[contextID].clearUri}`;
                                RDF4JRepositoriesRestService.addStatements($repositories.getActiveRepository(), data)
                                    .then(function () {
                                        $scope.loader = true;
                                        $scope.selectedGraphs.exportGraphs[contextID] = false;
                                        delete $scope.selectedGraphs.exportGraphs[contextID];
                                        counterOfClearedGraphs++;
                                        if (selectedGraphsForDelete.length === counterOfClearedGraphs) {
                                            $scope.selectedAll = false;
                                            $scope.exportFilter = '';
                                            $scope.filteredGraphs.length = 0;
                                            $scope.getGraphs();
                                            $scope.updateResults();
                                            $scope.changePageSize($scope.pageSize);
                                            toastr.success($translate.instant('export.cleared.graph.msg'));
                                            $scope.loader = false;
                                        }
                                    }, function (err) {
                                        const longName = $scope.graphsByValue[contextID].longName;
                                        toastr.error($translate.instant('export.clear.graph.msg', {longName: longName}), getError(err, err.status));
                                        $scope.selectedAll = false;
                                    });
                            });
                        }, 100);
                    }, function () {
                        $scope.deleting[ctx] = false;
                    });
                }
            }

            $scope.dropContext = function (ctx) {
                if (!$scope.canWriteActiveRepo()) {
                    return;
                }
                if (angular.isDefined(ctx)) {
                    dropGraph(ctx);
                } else {
                    dropSelectedGraphs(ctx);
                }
            };
        }]);
