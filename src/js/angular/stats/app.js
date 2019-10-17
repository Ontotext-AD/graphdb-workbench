import 'angular/core/services';
import SwaggerUI from 'swagger-ui'
import 'swagger-ui/dist/swagger-ui.css'

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
            controller: 'WebApiController',
            helpInfo: 'The REST API view documents the available public RESTful endpoints and '
            + 'provides an interactive interface to execute the requests.'
        });

        const getDocLink = function () {
            const pi = $menuItemsProvider.getProductInfo();
            if (pi.productType) {
                return 'http://graphdb.ontotext.com/documentation/' + pi.productShortVersion + '/' + pi.productType + '/';
            } else {
                return 'http://graphdb.ontotext.com/documentation/';
            }
        };

        const getDevHubLink = function () {
            const pi = $menuItemsProvider.getProductInfo();
            if (pi.productType) {
                return 'http://graphdb.ontotext.com/documentation/' + pi.productShortVersion + '/' + pi.productType + '/devhub/';
            } else {
                return 'http://graphdb.ontotext.com/documentation/free/devhub/';
            }
        };

        const getSupportLink = function () {
            const pi = $menuItemsProvider.getProductInfo();
            if (pi.productType) {
                return 'http://graphdb.ontotext.com/documentation/' + pi.productShortVersion + '/' + pi.productType + '/support.html';
            } else {
                return 'http://graphdb.ontotext.com/documentation/free/support.html';
            }
        };

        $menuItemsProvider.addItem({label: 'Setup', href: '#', order: 7, role: 'IS_AUTHENTICATED_FULLY', icon: 'icon-settings'});
        $menuItemsProvider.addItem({label: 'Help', href: '#', order: 8, icon: 'icon-help'});
        $menuItemsProvider.addItem({label: 'System information', href: 'sysinfo', order: 50, parent: 'Help', role: 'ROLE_ADMIN'});
        $menuItemsProvider.addItem({label: 'REST API', href: 'webapi', order: 1, parent: 'Help'});
        $menuItemsProvider.addItem({label: 'Documentation', hrefFun: getDocLink, order: 2, parent: 'Help', icon: 'icon-external'});
        $menuItemsProvider.addItem({label: 'Developer Hub', hrefFun: getDevHubLink, order: 3, parent: 'Help', icon: 'icon-external'});
        $menuItemsProvider.addItem({label: 'Support', hrefFun: getSupportLink, order: 4, parent: 'Help', icon: 'icon-external'});
    }]);

adminInfoApp.controller('AdminInfoCtrl', ['$scope', '$http', 'toastr', '$timeout', '$jwtAuth',
    function ($scope, $http, toastr, $timeout, $jwtAuth) {

        $http.get('rest/info/data')
            .success(function (data) {
                $scope.info = data;
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error');
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
                    toastr.error(msg, 'Error');
                });
        };

        $scope.getReportStatus();

        $scope.getReport = function () {
            let url = 'rest/report';
            if ($jwtAuth.isAuthenticated()) {
                url = url + '?authToken=' + encodeURIComponent($jwtAuth.getAuthToken());
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
                    toastr.error(msg, 'Error');
                });
        };
    }]);

adminInfoApp.controller('WebApiController', ['$scope', '$timeout', function ($scope, $timeout) {
    newSwaggerUi("/rest/api/workbench", "#swagger-ui-container-graphdb");
    newSwaggerUi("/rest/api/rdf4j", "#swagger-ui-container-rdf4j");
}]);

function newSwaggerUi(url, dom_id) {
    return new SwaggerUI({
        url: url,
        validatorUrl: null,
        dom_id: dom_id,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        docExpansion: "none",
        defaultModelRendering: 'example',
        // TODO: should we hide them?> rdf4j lack those, also, can't rdf4j expose them?
        defaultModelsExpandDepth: -1,
        // filter: true
    });
}
