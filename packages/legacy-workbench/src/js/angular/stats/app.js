import 'angular/core/services';

const adminInfoApp = angular.module('graphdb.framework.stats', ['toastr']);

adminInfoApp.controller('AdminInfoCtrl', ['$scope', '$http', 'toastr', '$timeout', '$jwtAuth', '$translate', 'AuthTokenService',
    function ($scope, $http, toastr, $timeout, $jwtAuth, $translate, AuthTokenService) {

        $http.get('rest/info/data')
            .success(function (data) {
                $scope.info = data;
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
            });


        //NONE, IN_PROGRESS, READY
        $scope.getReportStatus = function () {
            $http.get('rest/report/status')
                .success(function (data) {
                    const statusElements = data.split('|', 3);
                    $scope.status = statusElements[0];
                    $scope.timestamp = statusElements[1];
                    $scope.errorMessage = statusElements[2];

                    if ($scope.status === 'IN_PROGRESS') {
                        $timeout($scope.getReportStatus, 3000);
                    }
                })
                .error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, $translate.instant('common.error'));
                });
        };

        $scope.getReportStatus();

        $scope.getReport = function () {
            let url = 'rest/report';
            if ($jwtAuth.isAuthenticated()) {
                url = url + '?authToken=' + encodeURIComponent(AuthTokenService.getAuthToken());
            }

            window.open(url);
        };

        $scope.makeReport = function () {
            $http.post('rest/report')
                .success(function () {
                    $scope.status = 'IN_PROGRESS';
                    $timeout($scope.getReportStatus, 2000);
                })
                .error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, $translate.instant('common.error'));
                });
        };
    }]);
