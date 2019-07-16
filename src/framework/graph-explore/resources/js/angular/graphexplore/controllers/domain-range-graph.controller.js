define([],
    function (require) {

        angular
            .module('graphdb.framework.graphexplore.controllers.domainrange', [
                'ui.scroll.jqlite',
                'ui.scroll',
                'ngSanitize'
            ])
            .controller('DomainRangeGraphCtlr', DomainRangeGraphCtlr);

        DomainRangeGraphCtlr.$inject = ["$scope", "$location", "$rootScope", "$timeout", "$repositories", "$window", "localStorageService", "GraphDataService", "UiScrollService", "ModalService", "toastr"];
        function DomainRangeGraphCtlr($scope, $location, $rootScope, $timeout, $repositories, $window, localStorageService, GraphDataService, UiScrollService, ModalService, toastr) {
            $scope.predicatesObj = {};
            $scope.predicatesQueryObj = {};
            $scope.predicatesObj.items = [];
            $scope.predicatesQueryObj.query = "";
            $scope.predicatesListNotFiltered = [];
            $scope.predicatesSearchPlaceholder = "Search predicates";


            // creating datasource for predicates data
            var datasource = {},
                position = 0,
                current = 0;
            $rootScope.key = "";
            datasource.get = function (index, count, success) {
                return UiScrollService.initLazyList(index, count, success, position, $scope.predicatesObj.items);
            };
            $rootScope.$watch(function () {
                return $rootScope.key;
            }, function () {
                position = 0;
                _.each($scope.predicatesObj.items, function (item) {
                    if ($rootScope.key > item) position++;
                });
                current++;
            });

            datasource.revision = function () {
                return current;
            };

            // adapter implementation for ui-scroll directive
            $scope.adapterContainer = {adapter: {remain: true}};


            var doCollapseEdges = localStorageService.get("domainRange-collapseEdges");
            if (doCollapseEdges == null) {
                $scope.collapseEdges = true;
            } else {
                $scope.collapseEdges = doCollapseEdges === "true";
            }


            $scope.datasource = datasource;

            $scope.$on('reloadDomainRangeGraphView', reloadDomainRangeGraphView);
            $scope.$on('switchEdgeMode', switchEdgeMode);
            $scope.$on('repositoryIsSet', onRepositoryIsSet);
            $scope.$on('changeCollapsedEdgesState', function (event, collapsed) {
                $scope.collapseEdges = !collapsed;
                localStorageService.set("domainRange-collapseEdges", $scope.collapseEdges);
            });

            $scope.goToClassHierarchyView = goToClassHierarchyView;
            $scope.copyToClipboard = copyToClipboard;
            $scope.toggleCollapseEdgesState = toggleCollapseEdgesState;
            $scope.predicatesListFilterFunc = predicatesListFilterFunc;

            $scope.$watch('predicatesObj.items', function () {
                if ($scope.predicatesObj.items > 0) {
                    $timeout(function () {
                        $scope.adapterContainer.adapter.reload();
                    }, 30);
                }
            });

            $scope.$watch('selectedPredicate', function () {
                if ($scope.showPredicatesInfoPanel) {
                    prepareDataForPredicatesInfoSidePanel($scope.selectedPredicate);
                }
            });

            function predicatesListFilterFunc(pred) {
                return pred.resolvedUri
                        .toLowerCase()
                        .indexOf($scope.predicatesQueryObj.query.toLowerCase()) >= 0;
            }

            function prepareDataForPredicatesInfoSidePanel(selectedPredicate) {
                var targetNode = selectedPredicate.target;
                var sourceNode = selectedPredicate.source;

                $scope.encodedUri = encodeURIComponent(selectedPredicate.uri);

                $scope.sourceTargetObjectNodeUri = targetNode.objectPropClassUri
                    ? targetNode.objectPropClassUri
                    : sourceNode.objectPropClassUri;

                $scope.encodedSourceTargetObjectNodeUri = encodeURIComponent($scope.sourceTargetObjectNodeUri);

                $scope.sourceTargetObjectNodeName = targetNode.objectPropClassName
                    ? targetNode.objectPropClassName
                    : sourceNode.objectPropClassName
                    ? sourceNode.objectPropClassName
                    : '<i>Literal</i>';

                if ($scope.sourceTargetObjectNodeName.indexOf("Literal") == -1) {
                    GraphDataService.getRdfsLabelAndComment($scope.sourceTargetObjectNodeUri)
                        .success(function (response) {
                            $scope.rdfsLabel = response.label;
                            $scope.rdfsComment = response.comment;
                        })
                        .error(function () {
                            toastr.error("Error getting rdfs:label and rdfs:comment");
                        });
                } else {
                    $scope.rdfsComment = undefined;
                    $scope.rdfsLabel = undefined;
                }

                $scope.predicatesObj.items = [];

                // clear predicates search input field when changing edges
                $scope.predicatesQueryObj.query = '';

                // if target node of selected predicate has no edges then it is a left edge and edges should
                // come from the source node
                var allEdges = targetNode.allEdges
                    ? targetNode.allEdges
                    : sourceNode.allEdges;

                _.each(allEdges, function (pred) {
                    var obj = {};
                    obj.absUri = encodeURIComponent(pred.uri);
                    obj.absUriNonEncoded = pred.uri;
                    obj.resolvedUri = pred.name;
                    obj.isImplicit = pred.implicit;
                    $scope.predicatesObj.items.push(obj);
                });
                $scope.predicatesListNotFiltered = $scope.predicatesObj.items;
            }


            // Hack needed to force hide collapsed-mode toggle tooltip in order not be
            // visible after icon is switched
            $(document).ready(function () {
                $(".compact-mode-toggle").click(function () {
                    $(".tooltip").hide();
                });
            });

            function reloadDomainRangeGraphView(event, selectedClass, collapsed) {
                var uri = selectedClass.objectPropClassUri;
                var name = selectedClass.objectPropClassName;

                $location
                    .path("domain-range-graph")
                    .search("uri", uri)
                    .search("name", name);
            }

            function switchEdgeMode(event, selectedClass) {
                $location
                    .path("domain-range-graph")
                    .search("uri", selectedClass.uri)
                    .search("name", selectedClass.name)
                    .search("collapsed", selectedClass.collapsed);
            }

            function goToClassHierarchyView() {
                var lastSelectedClass = localStorageService.get('classHierarchy-lastSelectedClass');

                $location
                    .search("")
                    .hash(lastSelectedClass)
                    .path("hierarchy");
            }

            function toggleCollapseEdgesState() {
                $scope.collapseEdges = !$scope.collapseEdges;
                $window.history.pushState({collapsed: $scope.collapseEdges}, "domainRangePage", null);
            }

            function copyToClipboard(uri) {
                ModalService.openCopyToClipboardModal(uri);
            }


            var currentActiveRepository = $repositories.getActiveRepository();

            function onRepositoryIsSet(event) {
                if (currentActiveRepository === $repositories.getActiveRepository()) {
                    return;
                } else {
                    currentActiveRepository = $repositories.getActiveRepository();
                }
                goToClassHierarchyView();
            }
        }
    });
