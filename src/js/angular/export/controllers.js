import 'angular/core/services';
import 'angular/repositories/services';
import 'angular/security/services';

const modules = [
    'ngCookies',
    'ui.bootstrap',
    'graphdb.framework.repositories.services',
    'graphdb.framework.security.services',
    'toastr'
];

const exportCtrl = angular.module('graphdb.framework.impex.export.controllers', modules);

exportCtrl.controller('ExportCtrl',
    ["$scope",
        '$http',
        "$cookies",
        "$location",
        "$timeout",
        'ModalService',
        'filterFilter',
        '$repositories',
        'toastr',
        '$jwtAuth',
        function ($scope, $http, $cookies, $location, $timeout, ModalService, filterFilter, $repositories, toastr, $jwtAuth) {


            $scope.getActiveRepository = function () {
                return $repositories.getActiveRepository();
            };

            $scope.exportFormats = [
                {name: 'JSON', type: 'application/rdf+json', extension: '.json'},
                {name: 'JSON-LD', type: 'application/ld+json', extension: '.jsonld'},
                {name: 'RDF-XML', type: 'application/rdf+xml', extension: '.rdf'},
                {name: 'N3', type: 'text/rdf+n3', extension: '.n3'},
                {name: 'N-Triples', type: 'text/plain', extension: '.nt'},
                {name: 'N-Quads', type: 'text/x-nquads', extension: '.nq'},
                {name: 'Turtle', type: 'text/turtle', extension: '.ttl'},
                {name: 'TriX', type: 'application/trix', extension: '.trix'},
                {name: 'TriG', type: 'application/x-trig', extension: '.trig'},
                {name: 'Binary RDF', type: 'application/x-binary-rdf', extension: '.brf'}
            ];
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

            /// <summary>Get Graphs that are part of the Active Repository.</summary>
            $scope.getGraphs = function () {
                if ($scope.getActiveRepository() !== "") {
                    $scope.loader = true;
                    $http.get('repositories/' + $scope.getActiveRepository() + '/contexts').success(function (data, status, headers, config) {
                        data.results.bindings.unshift({
                            contextID: {
                                type: "default",
                                value: "The default graph"
                            }
                        });
                        $scope.graphsByValue = {};
                        for (let i in data.results.bindings) {
                            if (data.results.bindings[i].contextID.type === "bnode") {
                                data.results.bindings[i].contextID.value = '_:' + data.results.bindings[i].contextID.value;
                            } else if (data.results.bindings[i].contextID.type === "default") {
                                data.results.bindings[i].contextID.uri = encodeURIComponent("http://www.openrdf.org/schema/sesame#nil");
                                data.results.bindings[i].contextID.clearUri = "DEFAULT";
                                data.results.bindings[i].contextID.exportUri = "null";
                                data.results.bindings[i].contextID.longName = "default graph";
                            } else {
                                data.results.bindings[i].contextID.uri = encodeURIComponent(data.results.bindings[i].contextID.value);
                                data.results.bindings[i].contextID.clearUri = "GRAPH <" + data.results.bindings[i].contextID.value + ">";
                                data.results.bindings[i].contextID.exportUri = encodeURIComponent("<" + data.results.bindings[i].contextID.value + ">");
                                data.results.bindings[i].contextID.longName = "named graph " + data.results.bindings[i].contextID.value;
                            }
                            $scope.graphsByValue[data.results.bindings[i].contextID.value] = data.results.bindings[i].contextID;
                        }
                        $scope.graphs = data.results.bindings;
                        $scope.filteredGraphs = angular.copy($scope.graphs);
                        $scope.displayGraphs = $scope.filteredGraphs.slice($scope.pageSize * ($scope.page - 1), $scope.pageSize * $scope.page);
                        $scope.loader = false;
                        $scope.selectedGraphs.exportGraphs = {};
                        $scope.matchedElements = $scope.graphs;
                    }).error(function (data, status, headers, config) {
                        msg = getError(data, status);
                        if (msg === "There is no active location!") {
                            $repositories.setRepository('');
                            toastr.error(msg, 'Error');
                        }
                        $scope.loader = false;
                    });
                } else {
                    $scope.loader = false;
                }
            };

            $scope.downloadExport = function (downloadUrl, format) {
                var url = downloadUrl + "&Accept=" + encodeURIComponent(format.type);
                var cookie = $cookies['com.ontotext.graphdb.auth' + $location.port()];
                if (cookie) {
                    url = url + '&authToken=' + encodeURIComponent(cookie);
                }
                window.open(url);
            };


            /// <summary>Trigger the custom event for DD tooltip.</summary>
            $scope.openExportDDTooltip = function (e) {
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

                if (format.type == 'application/rdf+xml' || format.type == 'text/plain' || format.type == 'text/turtle' || format.type == 'text/rdf+n3') {
                    ModalService.openSimpleModal({
                        title: 'Warning',
                        message: 'This format does not support graphs.<br>Graph information will not be available in the export.',
                        warning: true
                    }).result
                        .then(function () {
                            $scope.startDownload(format, contextID);
                        });
                } else {
                    $scope.startDownload(format, contextID);
                }
            };

            $scope.startDownload = function (format, contextID) {

                //If it's graph set the url for ?context=
                var downloadUrl;
                if (contextID) {
                    downloadUrl = 'repositories/' + $scope.getActiveRepository() + '/statements?infer=false&context=' + $scope.graphsByValue[contextID.value].exportUri;
                } else {
                    downloadUrl = 'repositories/' + $scope.getActiveRepository() + '/statements?infer=false';
                }
                $scope.downloadExport(downloadUrl, format);
            };

            $scope.hasMultipleSelected = function () {
                if (_.isEmpty($scope.selectedGraphs.exportGraphs)) {
                    return !_.isEmpty($scope.selectedGraphs.exportGraphs);
                } else {
                    for (var index in $scope.selectedGraphs.exportGraphs) {
                        if ($scope.selectedGraphs.exportGraphs[index] == true) {
                            return true;
                        }
                    }
                    return false;
                }

            };

            $scope.exportSelectedGraphs = function (format) {
                var contextStr = '';
                for (var index in $scope.selectedGraphs.exportGraphs) {
                    if ($scope.selectedGraphs.exportGraphs[index]) {
                        contextStr += 'context=' + $scope.graphsByValue[index].exportUri + '&';
                    }
                }

                if (contextStr) {

                    var startDownload = function () {
                        contextStr = contextStr.substring(0, contextStr.length - 1);
                        var downloadUrl = 'repositories/' + $scope.getActiveRepository() + '/statements?infer=false&' + contextStr;
                        $scope.downloadExport(downloadUrl, format);
                    };

                    if (format.type == 'application/rdf+xml' || format.type == 'text/plain' || format.type == 'text/turtle' || format.type == 'text/rdf+n3') {
                        ModalService.openSimpleModal({
                            title: 'Warning',
                            message: 'This format does not support graphs.<br>Graph information will not be available in the export.',
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
                        title: 'Multiple graph export',
                        message: 'Check graphs you want to export first.',
                        warning: true
                    });
                }
            };

            $scope.$watch('exportFilter', function (newValue, oldValue) {
                $scope.filteredGraphs = filterFilter($scope.graphs, $scope.exportFilter);
                if ($scope.getActiveRepository() !== "" && angular.element(document).find('.btn.btn-secondary.btn-sm.dropdown-toggle span').length) {
                    var valueOfFilteredGraphsButton = angular.element(document).find('.btn.btn-secondary.btn-sm.dropdown-toggle span')[0].innerHTML.trim();
                    var valueOfFilteredGraphs;
                    if (valueOfFilteredGraphsButton === "All") {
                        valueOfFilteredGraphs = $scope.filteredGraphs.length;
                    }
                    if ($scope.filteredGraphs && $scope.filteredGraphs.length > $scope.pageSize && valueOfFilteredGraphsButton !== "All") {
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
                if ($scope.selectedAll) {
                    $scope.selectedAll = true;
                } else {
                    $scope.selectedAll = false;
                }
                angular.forEach($scope.displayGraphs, function (item, index) {
                    if (item.contextID.uri) {
                        $scope.selectedGraphs.exportGraphs[item.contextID.value] = $scope.selectedAll;
                    }
                });
            };

            $scope.deselectAll = function () {
                $scope.selectedAll = false;
                angular.forEach($scope.displayGraphs, function (item, index) {
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
                    title: 'Confirm clear repository',
                    message: "Are you sure you want to clear repository " + $repositories.getActiveRepository() + "?",
                    warning: true
                }).result
                    .then(function () {
                        $timeout(function () {
                            var url = 'repositories/' + $repositories.getActiveRepository() + '/statements';
                            $http({
                                method: 'POST',
                                url: url,
                                data: "update=CLEAR ALL",
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            })
                                .then(function (res) {
                                    $scope.deleting['*'] = false;
                                    toastr.success('Cleared repository ' + $repositories.getActiveRepository());
                                    $scope.getGraphs();
                                }, function (err) {
                                    $scope.deleting['*'] = false;
                                    toastr.error('Failed to clear repository ' + $repositories.getActiveRepository(), err);
                                });
                        }, 100);
                    });
            };

            $scope.dropContext = function (ctx) {
                if (!$scope.canWriteActiveRepo()) {
                    return;
                }
                if (angular.isDefined(ctx)) {
                    var longName = ctx.contextID.longName;
                    $scope.deleting[ctx] = true;
                    ModalService.openSimpleModal({
                        title: 'Confirm clear graph',
                        message: "Are you sure you want to clear the " + longName + "?",
                        warning: true
                    }).result
                        .then(function () {
                            $timeout(function () {
                                var url = 'repositories/' + $repositories.getActiveRepository() + '/statements';
                                var clearUri = ctx.contextID.clearUri;
                                $http({
                                    method: 'POST',
                                    url: url,
                                    data: "update=CLEAR " + clearUri,
                                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                }).then(function (res) {
                                    $scope.deleting[ctx] = false;
                                    toastr.success('Cleared the ' + longName);
                                    $scope.getGraphs();
                                    $scope.exportFilter = "";
                                    $scope.filteredGraphs.length = 0;
                                    $scope.updateResults();
                                    $scope.changePageSize($scope.pageSize);
                                }, function (err) {
                                    $scope.deleting[ctx] = false;
                                    toastr.error('Failed to clear the ' + longName, getError(err, err.status));
                                });
                            }, 100);
                        }, function () {
                            $scope.deleting[ctx] = false;
                        });
                }
                else {
                    var selectedGraphsForDelete = [];
                    angular.forEach($scope.selectedGraphs.exportGraphs, function (value, key) {
                        if (value) {
                            selectedGraphsForDelete.push(key);
                        }
                    });
                    if (selectedGraphsForDelete.length > 0) {

                        $scope.deleting[ctx] = true;
                        ModalService.openSimpleModal({
                            title: 'Confirm clear graphs',
                            message: "Are you sure you want to clear the selected graphs?",
                            warning: true
                        }).result.then(function () {
                            $timeout(function () {
                                var counterOfClearedGraphs = 0;
                                var url = 'repositories/' + $repositories.getActiveRepository() + '/statements';
                                angular.forEach(selectedGraphsForDelete, function (contextID) {
                                    var clearUri = $scope.graphsByValue[contextID].clearUri;
                                    var longName = $scope.graphsByValue[contextID].longName;
                                    $http({
                                        method: 'POST',
                                        url: url,
                                        data: "update=CLEAR " + clearUri,
                                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                    }).then(function (res) {
                                        $scope.loader = true;
                                        $scope.selectedGraphs.exportGraphs[contextID] = false;
                                        delete $scope.selectedGraphs.exportGraphs[contextID];
                                        counterOfClearedGraphs++;
                                        if (selectedGraphsForDelete.length === counterOfClearedGraphs) {
                                            $scope.selectedAll = false;
                                            $scope.exportFilter = "";
                                            $scope.filteredGraphs.length = 0;
                                            $scope.getGraphs();
                                            $scope.updateResults();
                                            $scope.changePageSize($scope.pageSize);
                                            toastr.success('Cleared the selected graphs');
                                            $scope.loader = false;
                                        }
                                    }, function (err) {
                                        toastr.error('Failed to clear the ' + longName, getError(err, err.status));
                                        $scope.selectedAll = false;
                                    });
                                });
                            }, 100);
                        }, function () {
                            $scope.deleting[ctx] = false;
                        });
                    }
                }
            };
        }]);
