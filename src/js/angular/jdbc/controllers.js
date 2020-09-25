import 'angular/core/services';
import 'angular/core/services/repositories.service';
import 'angular/rest/monitoring.rest.service';

const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.rest.monitoring.service',
    'toastr'
];

angular.module('graphdb.framework.jdbc.controllers', modules)
    .controller('JdbcListCtrl', JdbcListCtrl);

JdbcListCtrl.$inject = ['$scope', '$interval', 'toastr', '$repositories', '$modal', '$timeout'];

function JdbcListCtrl($scope, $interval, toastr, $repositories, $modal, $timeout) {

    $scope.getActiveRepository = function () {
        return $repositories.getActiveRepository();
    };
}
