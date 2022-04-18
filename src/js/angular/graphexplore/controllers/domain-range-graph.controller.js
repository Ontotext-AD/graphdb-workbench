import 'angular/utils/local-storage-adapter';

angular
    .module('graphdb.framework.graphexplore.controllers.domainrange', [
        'ui.scroll.jqlite',
        'ui.scroll',
        'ngSanitize',
        'graphdb.framework.utils.localstorageadapter'
    ])
    .controller('DomainRangeGraphCtlr', DomainRangeGraphCtlr);

DomainRangeGraphCtlr.$inject = ['$scope', '$location', '$rootScope', '$timeout', '$repositories', '$window', 'LocalStorageAdapter', 'LSKeys', 'GraphDataRestService', 'UiScrollService', 'ModalService', 'toastr', '$translate'];

function DomainRangeGraphCtlr($scope, $location, $rootScope, $timeout, $repositories, $window, LocalStorageAdapter, LSKeys, GraphDataRestService, UiScrollService, ModalService, toastr, $translate) {
    $scope.predicatesObj = {};
    $scope.predicatesQueryObj = {};
    $scope.predicatesObj.items = [];
    $scope.predicatesQueryObj.query = '';
    $scope.predicatesListNotFiltered = [];
    $scope.predicatesSearchPlaceholder = 'Search predicates';

    // Handle pageslide directive callbacks which incidentally appeared to be present in the angular's
    // scope, so we need to define our's and pass them to pageslide, otherwise it throws an error.
    $scope.onopen = $scope.onclose = () => angular.noop();

    // creating datasource for predicates data
    const datasource = {};
    let position = 0;
    let current = 0;
    $rootScope.key = '';
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


    const doCollapseEdges = LocalStorageAdapter.get(LSKeys.DOMAIN_RANGE_COLLAPSE_EDGES);
    if (doCollapseEdges === null) {
        $scope.collapseEdges = true;
    } else {
        $scope.collapseEdges = doCollapseEdges === 'true';
    }

    $scope.datasource = datasource;

    $scope.$on('reloadDomainRangeGraphView', reloadDomainRangeGraphView);
    $scope.$on('switchEdgeMode', switchEdgeMode);
    $scope.$on('repositoryIsSet', onRepositoryIsSet);
    $scope.$on('changeCollapsedEdgesState', function (event, collapsed) {
        $scope.collapseEdges = !collapsed;
        LocalStorageAdapter.set(LSKeys.DOMAIN_RANGE_COLLAPSE_EDGES, $scope.collapseEdges);
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
        const targetNode = selectedPredicate.target;
        const sourceNode = selectedPredicate.source;

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

        if ($scope.sourceTargetObjectNodeName.indexOf('Literal') === -1) {
            GraphDataRestService.getRdfsLabelAndComment($scope.sourceTargetObjectNodeUri)
                .success(function (response) {
                    $scope.rdfsLabel = response.label;
                    $scope.rdfsComment = response.comment;
                })
                .error(function () {
                    toastr.error($translate.instant('domain.range.error.get.label.comment'));
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
        const allEdges = targetNode.allEdges
            ? targetNode.allEdges
            : sourceNode.allEdges;

        _.each(allEdges, function (pred) {
            const obj = {};
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
        $('.compact-mode-toggle').click(function () {
            $('.tooltip').hide();
        });
    });

    function reloadDomainRangeGraphView(event, selectedClass) {
        const uri = selectedClass.objectPropClassUri;
        const name = selectedClass.objectPropClassName;

        $location
            .path('domain-range-graph')
            .search('uri', uri)
            .search('name', name);
    }

    function switchEdgeMode(event, selectedClass) {
        $location
            .path('domain-range-graph')
            .search('uri', selectedClass.uri)
            .search('name', selectedClass.name)
            .search('collapsed', selectedClass.collapsed);
    }

    function goToClassHierarchyView() {
        const lastSelectedClass = LocalStorageAdapter.get(LSKeys.CLASS_HIERARCHY_LAST_SELECTED_CLASS);

        $location
            .search('')
            .hash(lastSelectedClass)
            .path('hierarchy');
    }

    function toggleCollapseEdgesState() {
        $scope.collapseEdges = !$scope.collapseEdges;
        $window.history.pushState({collapsed: $scope.collapseEdges}, 'domainRangePage', null);
    }

    function copyToClipboard(uri) {
        ModalService.openCopyToClipboardModal(uri);
    }


    let currentActiveRepository = $repositories.getActiveRepository();

    function onRepositoryIsSet() {
        if (currentActiveRepository === $repositories.getActiveRepository()) {
            return;
        } else {
            currentActiveRepository = $repositories.getActiveRepository();
        }
        goToClassHierarchyView();
    }
}
