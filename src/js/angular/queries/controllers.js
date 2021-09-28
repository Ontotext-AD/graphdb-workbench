import 'angular/core/services';
import 'angular/rest/monitoring.rest.service';

const queriesCtrl = angular.module('graphdb.framework.jmx.queries.controllers', [
    'ui.bootstrap',
    'toastr',
    'graphdb.framework.rest.monitoring.service'
]);

queriesCtrl.controller('QueriesCtrl', ['$scope', '$modal', 'toastr', '$interval', '$repositories', '$jwtAuth', 'ModalService', 'MonitoringRestService',
    function ($scope, $modal, toastr, $interval, $repositories, $jwtAuth, ModalService, MonitoringRestService) {

        $scope.loader = true;
        $scope.stringLimit = 500;
        $scope.expanded = {};
        $scope.jolokiaError = '';

        function containsIPV4(ip) {
            const blocks = ip.split('.');
            for (let i = 0, sequence = 0; i < blocks.length; i++) {
                if (parseInt(blocks[i], 10) >= 0 && parseInt(blocks[i], 10) <= 255) {
                    sequence++;
                } else {
                    sequence = 0;
                }
                if (sequence === 4) {
                    return true;
                }
            }
            return false;
        }

        const parser = document.createElement('a');

        // Parses a node of the kind http://host.example.com:7200/repositories/repo#NN,
        // where NN is the track ID into an array [NN, host:7200, repo].
        $scope.parseNode = function (node) {
            if (node == null) {
                return null;
            }

            let shortUrl = 'local';
            if (node.indexOf('://localhost:') < 0 && node.indexOf('://localhost/') < 0) {
                parser.href = node;
                let hostname = parser.hostname;
                if (!containsIPV4(parser.hostname)) {
                    hostname = parser.hostname.split('.')[0];
                }
                shortUrl = hostname + ':' + parser.port;
            }
            const match = node.match(/\/repositories\/([^\/]+)#(\d+)/); // eslint-disable-line no-useless-escape

            return [match[2], shortUrl, match[1]];
        };

        $scope.getQueries = function () {
            // Skip execution if already getting from previous call, if paused, if jolokia returned an error,
            // or if no repository is available
            if ($scope.getQueriesRunning || $scope.paused || $scope.jolokiaError || !$repositories.getActiveRepository()) {
                return;
            }

            $scope.getQueriesRunning = true;
            MonitoringRestService.monitorQuery().success(function (data) {
                const newQueries = data;
                $scope.noQueries = newQueries.length === 0;

                // Converts array to object. Angular seems to handle updates on objects better, i.e.
                // it doesn't recreate DOM elements for queries that are already displayed.
                $scope.queries = {};
                for (let i = 0; i < newQueries.length; i++) {
                    newQueries[i].parsedNode = $scope.parseNode(newQueries[i].node);
                    $scope.queries[newQueries[i].trackId] = newQueries[i];
                }

                $scope.noActiveRepository = false;
                $scope.loader = false;
                $scope.getQueriesRunning = false;
            }).error(function (data) {
                $scope.jolokiaError = getError(data);
                $scope.loader = false;
                $scope.getQueriesRunning = false;
            });
        };

        const timer = $interval(function () {
            // Don't call getQueries for Ontop type repository
            if ($repositories.isActiveRepoOntopType()) {
                return;
            }
            $scope.getQueries();
        }, 1000);

        $scope.$on('$destroy', function () {
            $interval.cancel(timer);
        });

        $scope.deleteQueryHttp = function (queryId) {

            $scope.loader = true;
            MonitoringRestService.deleteQuery(queryId).success(function () {
                toastr.success('Abort request sent.');
                $scope.loader = false;
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error');

                $scope.loader = false;
            });
        };

        $scope.abortQuery = function (queryId) {
            ModalService.openSimpleModal({
                title: 'Confirm abort',
                message: 'Are you sure you want to abort the query?',
                warning: true
            }).result.then(function () {
                $scope.deleteQueryHttp(queryId);
            });
        };

        $scope.downloadQuery = function (queryId) {
            const filename = 'query_' + queryId + '.rq';
            let link = 'rest/monitor/query/download?queryId=' + encodeURIComponent(queryId)
                + '&repository=' + encodeURIComponent($repositories.getActiveRepository())
                + '&filename=' + encodeURIComponent(filename);
            if ($jwtAuth.isAuthenticated()) {
                link = link + '&authToken=' + encodeURIComponent($jwtAuth.getAuthToken());
            }

            window.open(link, '_blank');
        };

        $scope.toggleQueryExpanded = function (queryId) {
            $scope.expanded[queryId] = !$scope.expanded[queryId];
        };
    }]);


queriesCtrl.controller('DeleteQueryCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
