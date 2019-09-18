import 'angular/core/services';

const adminInfoApp = angular.module('graphdb.framework.stats', ['toastr']);

adminInfoApp.config(['$routeProvider', '$locationProvider', '$menuItemsProvider',
    function ($routeProvider, $locationProvider, $menuItemsProvider) {
        $routeProvider.when('/sysinfo', {
            templateUrl: 'pages/info.html',
            controller: 'AdminInfoCtrl',
            title: 'System information',
            helpInfo: 'The System information view shows the configuration values of the JVM '
            + 'running the GraphDB Workbench as well generate a detailed server report file you can use to hunt down issues'
        }).when('/webapi', {
            templateUrl: 'pages/webapi.html',
            title: 'REST API documentation',
            helpInfo: 'The REST API view documents the available public RESTful endpoints and '
            + 'provides an interactive interface to execute the requests.'
        });

        var getDocLink = function () {
            var pi = $menuItemsProvider.getProductInfo();
            if (pi.productType) {
                return 'http://graphdb.ontotext.com/documentation/' + pi.productShortVersion + '/' + pi.productType + '/';
            } else {
                return 'http://graphdb.ontotext.com/documentation/';
            }
        };

        var getDevHubLink = function () {
            var pi = $menuItemsProvider.getProductInfo();
            if (pi.productType) {
                return 'http://graphdb.ontotext.com/documentation/' + pi.productShortVersion + '/' + pi.productType + '/devhub/';
            } else {
                return 'http://graphdb.ontotext.com/documentation/free/devhub/';
            }
        };

        var getSupportLink = function () {
            var pi = $menuItemsProvider.getProductInfo();
            if (pi.productType) {
                return 'http://graphdb.ontotext.com/documentation/' + pi.productShortVersion + '/' + pi.productType + '/support.html';
            } else {
                return 'http://graphdb.ontotext.com/documentation/free/support.html';
            }
        };

        $menuItemsProvider.addItem({label: 'Setup', href: '#', order: 7, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"});
        $menuItemsProvider.addItem({label: 'Help', href: '#', order: 8, icon: "icon-help"});
        $menuItemsProvider.addItem({label: 'System information', href: 'sysinfo', order: 50, parent: 'Help', role: 'ROLE_ADMIN'});
        $menuItemsProvider.addItem({label: 'REST API', href: 'webapi', order: 1, parent: 'Help'});
        $menuItemsProvider.addItem({label: 'Documentation', hrefFun: getDocLink, order: 2, parent: 'Help', icon: "icon-external"});
        $menuItemsProvider.addItem({label: 'Developer Hub', hrefFun: getDevHubLink, order: 3, parent: 'Help', icon: "icon-external"});
        $menuItemsProvider.addItem({label: 'Support', hrefFun: getSupportLink, order: 4, parent: 'Help', icon: "icon-external"});
    }]);

adminInfoApp.controller('AdminInfoCtrl', ['$scope', '$http', 'toastr', '$timeout', '$jwtAuth', 'productInfo',
    function ($scope, $http, toastr, $timeout, $jwtAuth, productInfo) {

        $http.get("rest/info/data")
            .success(function (data, status, headers, config) {
                $scope.info = data;
            })
            .error(function (data, status, headers, config) {
                let msg = getError(data);
                toastr.error(msg, 'Error');
            });


        //NONE, IN_PROGRESS, READY
        $scope.getReportStatus = function (endTimerOnSuccess) {
            $http.get("rest/report/status")
                .success(function (data, status, headers, config) {
                    var statusElements = data.split("|", 3);
                    $scope.status = statusElements[0];
                    $scope.timestamp = statusElements[1];
                    $scope.errorMessage = statusElements[2];

                    if ($scope.status == 'IN_PROGRESS') {
                        $timeout($scope.getReportStatus, 3000);
                    }
                })
                .error(function (data, status, headers, config) {
                    msg = getError(data);
                    toastr.error(msg, 'Error');
                });
        };

        $scope.getReportStatus();

        $scope.getReport = function () {
            var url = 'rest/report';
            if ($jwtAuth.isAuthenticated()) {
                url = url + "?authToken=" + encodeURIComponent($jwtAuth.getAuthToken());
            }

            window.open(url);
        };

        $scope.makeReport = function () {
            $http.post("rest/report")
                .success(function (data, status, headers, config) {
                    $scope.status = 'IN_PROGRESS';
                    $timeout($scope.getReportStatus, 2000);
                })
                .error(function (data, status, headers, config) {
                    let msg = getError(data);
                    toastr.error(msg, 'Error');
                });
        }

    }]);
