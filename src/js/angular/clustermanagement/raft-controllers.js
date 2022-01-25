import 'angular/core/services';
import 'angular/rest/cluster.rest.service';

const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.rest.repositories.service',
    'graphdb.framework.rest.cluster.service',
    'toastr'
];

angular
    .module('graphdb.framework.clustermanagement.raftControllers', modules)
    .controller('ClusterManagementCtrl', ClusterManagementCtrl);

function getLocation(node) {
    if (node.local) {
        return 'local';
    }
    return node.location.split('/repositories/')[0];
}

ClusterManagementCtrl.$inject = ['$scope', '$http', '$q', 'toastr', '$repositories', '$modal', '$sce',
    '$window', '$interval', 'ModalService', '$timeout', 'ClusterRestService'];

function ClusterManagementCtrl($scope, $http, $q, toastr, $repositories, $modal, $sce,
                               $window, $interval, ModalService, $timeout, ClusterRestService) {
    // TODO: Similar function is declared multiple times in different components. Find out how to avoid it!
    $scope.setLoader = function (loader, message) {
        $timeout.cancel($scope.loaderTimeout);
        if (loader) {
            $scope.loaderTimeout = $timeout(function () {
                $scope.loader = loader;
                $scope.loaderMessage = message;
            }, 300);
        } else {
            $scope.loader = false;
        }
    };

    $scope.getLoaderMessage = function () {
        return $scope.loaderMessage || 'Loading...';
    };

    $scope.locations = function () {
        return $repositories.getLocations();
    };

    $scope.getLabel = function (url) {
        if (url.indexOf("http") !== 0) {
            return name;
        }
        return url.substring(url.indexOf('/repositories') + 14);
    };

    // Called directives so we include scope apply here
    $scope.selectNode = function (node) {
        if ($scope.selectedNode !== node) {
            $scope.selectedNode = node;
        } else {
            $scope.selectedNode = null;
        }
        $scope.$apply();
    };

    $scope.addOrUpdateLink = function (source, target, status, timestamp) {
        const key = source.location + '|' + target.location;
        let link = $scope.linksHash[key];
        const reverseKey = target.location + '|' + source.location;
        const reverseLink = $scope.linksHash[reverseKey];
        if (!link) {
            // adding a new link
            link = {};
            $scope.linksHash[key] = link;
            $scope.links.push(link);
            link['source'] = source;
            link['target'] = target;
            $scope.needsToRestart = true;
        } else {
            // updating, check if status changed
            // no-op at the moment
        }
        link['status'] = status;
        link['timestamp'] = timestamp;

        link['reversePeerMissing'] = source.repositoryType === 'master' && target.repositoryType === 'master' && !reverseLink;
        if (reverseLink && reverseLink['reversePeerMissing']) {
            reverseLink['reversePeerMissing'] = false;
        }
        $scope.linksHash[key] = link;

        if ($scope.updateWarnings) { // function isn't defined before render() is called
            $scope.updateWarnings();
        }

        return link;
    };

    $scope.deleteLink = function (link, deleteReverse) {
        $scope.links.splice($scope.links.indexOf(link), 1);
        const key = link.source.location + '|' + link.target.location;
        delete $scope.linksHash[key];
        if (link.source.disabledReason || link.target.disabledReason) {
            // removing a link to a funky node triggers a refresh to get rid of that node
            console.log("link to funky node removed, refresh");
            $scope.needsToRefresh = true;
        }

        if (deleteReverse) {
            const reverseKey = link.target.location + '|' + link.source.location;
            const reverseLink = $scope.linksHash[reverseKey];
            if (reverseLink) {
                $scope.deleteLink(reverseLink, false);
            }
        }
    };

    $scope.getNodes = function () {
        // Reset all of these, just in case
        $scope.nodes = [];
        $scope.links = [];
        $scope.linksHash = {};
        $scope.clone = {};
        $scope.selectedNode = null;

        $scope.setLoader(true);

        return ClusterRestService.getClusterConfig()
            .success(function (data) {
                $scope.hasNodes = data.nodes.length > 0;
                $scope.links = [];
                $scope.linksHash = {};

                $scope.urlToNode = data.nodes.reduce(function (result, node) {
                    result[node.address] = {
                        location: node.address,
                        nodeState: node.nodeState,
                        matchIndex: node.matchIndex,
                        term: node.term
                    };
                    return result;
                }, {});

                const leaderNode = data.nodes.find(node => node.nodeState === 'LEADER');

                if (leaderNode) {
                    Object.keys(leaderNode.syncStatus).forEach((key) => {
                        if (key === leaderNode.address) {
                            $scope.urlToNode[key].syncStatus = 'IN_SYNC';
                        } else {
                            if ($scope.urlToNode[key]) {
                                $scope.urlToNode[key].syncStatus = leaderNode.syncStatus[key];
                            } else {
                                $scope.urlToNode[key] = {};
                                $scope.urlToNode[key].location = key;
                                $scope.urlToNode[key].syncStatus = leaderNode.syncStatus[key];
                            }
                        }
                    });
                }

                return $q.all(leaderNode).finally(function () {
                    $scope.nodes = _.sortBy(
                        Object.keys($scope.urlToNode).map(function (key) {
                            return $scope.urlToNode[key];
                        }),
                        ['name']
                    );

                    $scope.render();

                    $scope.setLoader(false);
                });

            })
            .error(function (data) {
                $scope.hasNodes = false;
                toastr.error(getError(data), "Error getting nodes");
                $scope.setLoader(false);
            })
            .finally(function () {
                $scope.needsToRefresh = false;
            });
    };

    $scope.getNodes();

    const timer = $interval(function () {
        $scope.getNodes();
    }, 2000);

    $scope.$on("$destroy", function () {
        $interval.cancel(timer);
    });

    $scope.attributeChange = false;
    $scope.updating = false;

    // track window resizing
    const w = angular.element($window);
    const resize = function () {
        $scope.resize();
    };
    w.bind('resize', resize);
    $scope.$on('$destroy', function () {
        w.unbind('resize', resize);
    });

    // track collapsing the nav bar
    $scope.$on('onToggleNavWidth', function () {
        $scope.resize();
    });
}
