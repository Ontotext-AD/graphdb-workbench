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

    $scope.getActiveRepository = function () {
        return $repositories.getActiveRepository();
    };

    $scope.getSqlConfigurations = function () {
        JdbcRestService.getJdbcConfigurations().success(function(data) {
            $scope.jdbcConfigurations = data;
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, 'Could not get SQL table configurations');
        });
    }
}

JdbcCreateCtrl.$inject = ['$scope', '$location', 'toastr', '$repositories', '$modal', '$timeout', 'JdbcRestService'];
function JdbcCreateCtrl($scope, $location, toastr, $repositories, $modal, $timeout, JdbcRestService) {

    $scope.name = $location.search().name || 'new';
}
