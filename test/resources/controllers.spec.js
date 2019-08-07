import "angular/core/services";
import "angular/repositories/services";
import "angular/resources/controllers";

beforeEach(angular.mock.module('graphdb.framework.jmx.resources.controllers', function ($provide) {
    $provide.constant("productInfo", {
        "productType": "standard", "productVersion": "7.0", "sesame": "2.9.0", "connectors": "5.0.0"
    });
}));

describe('=> ResourcesCtrl tests', function () {
    var $httpBackend,
        $controller,
        $timeout,
        $interval,
        $scope,
        $repositories,
        httpGetResourcesData;

    beforeEach(angular.mock.inject(function (_$httpBackend_, _$repositories_, _$location_, _$controller_, _$window_, _$timeout_, _$interval_, $rootScope) {

        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        $timeout = _$timeout_;
        $interval = _$interval_;
        $repositories = _$repositories_;

        httpGetResourcesData = $httpBackend.when('GET', 'rest/monitor/resource').respond(200, {
            "heapMemoryUsage": {
                "max": 1888485376,
                "committed": 703594496,
                "init": 134217728,
                "used": 212264560
            },
            "nonHeapMemoryUsage": {
                "max": -1,
                "committed": 124477440,
                "init": 2555904,
                "used": 122066392
            },
            "threadCount": 20,
            "cpuLoad": 19.695456009969313,
            "classCount": 13173
        });

        $httpBackend.when('GET', 'rest/security/all').respond(200, {
            enabled: false,
            freeAcesss: {enabled: false},
            overrideAuth: {enabled: false}
        });
        $httpBackend.when('GET', 'rest/locations/active').respond(200, {locationUri: ''});
        $httpBackend.when('GET', 'rest/security/user/admin').respond(200, {
            username: 'admin',
            appSettings: {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true},
            authorities: ['ROLE_ADMIN']
        });

        $scope = $rootScope.$new();
        var controller = $controller('ResourcesCtrl', {$scope: $scope});

        jasmine.clock().install();
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();

        jasmine.clock().uninstall();
    });

    describe('$scope.getResourcesData()', function () {
        it('should call function on every 2s', function () {
            $scope.getActiveRepository = function () {
                return 'activeRepository'
            }
            $httpBackend.expectGET('rest/monitor/resource')
            $interval.flush(2001);
            expect($httpBackend.flush).not.toThrow();
            $interval.flush(2000);
            expect($httpBackend.flush).not.toThrow();
            $interval.flush(2000);
            expect($httpBackend.flush).not.toThrow();
        });

        it('should set $scope.data correct', function () {
            $scope.getActiveRepository = function () {
                return 'activeRepository'
            }
            $httpBackend.expectGET('rest/monitor/resource');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();

            expect($scope.firstLoad).toBeTruthy();

            $interval.flush(2001);
            $httpBackend.flush();
            expect($scope.firstLoad).toBeFalsy();
            expect($scope.data.classCount).toEqual([{key: "Classes", values: [[today, 26346], [today, 13173]]}])
            expect($scope.data.cpuLoad).toEqual([{key: "System CPU Load", values: [[today, 39.4], [today, '19.6955']]}])
            expect($scope.data.memoryUsage).toEqual([{key: "Used memory", values: [[today, 0.42], [today, '0.2123']]}])
            expect($scope.data.threadCount).toEqual([{key: "Thread Count", values: [[today, 40], [today, 20]]}])
            $interval.flush(2000);
            $httpBackend.flush();
            expect($scope.data.classCount).toEqual([{key: "Classes", values: [[today, 26346], [today, 13173], [today, 13173]]}])
            expect($scope.data.cpuLoad).toEqual([{key: "System CPU Load", values: [[today, 39.4], [today, '19.6955'], [today, '19.6955']]}])
            expect($scope.data.memoryUsage).toEqual([{key: "Used memory", values: [[today, 0.42], [today, '0.2123'], [today, '0.2123']]}])
            expect($scope.data.threadCount).toEqual([{key: "Thread Count", values: [[today, 40], [today, 20], [today, 20]]}])
        });

        it('should set data.cpuLoad[0].values[0][1] to 100 if the current value is above 50', function () {

            $scope.getActiveRepository = function () {
                return 'activeRepository'
            }
            $httpBackend.expectGET('rest/monitor/resource');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();

            $interval.flush(2001);
            $httpBackend.flush();
            expect($scope.data.cpuLoad).toEqual([{key: "System CPU Load", values: [[today, 39.4], [today, '19.6955']]}]);

            httpGetResourcesData.respond(200, {
                "heapMemoryUsage": {
                    "max": 1888485376,
                    "committed": 703594496,
                    "init": 134217728,
                    "used": 212264560
                },
                "nonHeapMemoryUsage": {
                    "max": -1,
                    "committed": 124477440,
                    "init": 2555904,
                    "used": 122066392
                },
                "threadCount": 20,
                "cpuLoad": 51.695456009969313,
                "classCount": 13173
            });


            $interval.flush(2000);
            $httpBackend.flush();
            expect($scope.data.cpuLoad).toEqual([{key: "System CPU Load", values: [[today, 100], [today, '19.6955'], [today, '51.6955']]}]);
        });

        it('should set data.classCount[0].values[0][1] if the current value is > than values[0][1]', function () {

            $scope.getActiveRepository = function () {
                return 'activeRepository'
            }
            $httpBackend.expectGET('rest/monitor/resource');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();

            $interval.flush(2001);
            $httpBackend.flush();
            expect($scope.data.classCount).toEqual([{key: "Classes", values: [[today, 26346], [today, 13173]]}])

            httpGetResourcesData.respond(200, {
                "heapMemoryUsage": {
                    "max": 1888485376,
                    "committed": 703594496,
                    "init": 134217728,
                    "used": 212264560
                },
                "nonHeapMemoryUsage": {
                    "max": -1,
                    "committed": 124477440,
                    "init": 2555904,
                    "used": 122066392
                },
                "threadCount": 20,
                "cpuLoad": 19.695456009969313,
                "classCount": 33173
            });


            $interval.flush(2000);
            $httpBackend.flush();
            expect($scope.data.classCount).toEqual([{key: "Classes", values: [[today, 66346], [today, 13173], [today, 33173]]}])
        })

        it('should set data.heapMemoryUsage[0].values[0][1] if the current value is > than values[0][1]', function () {

            $scope.getActiveRepository = function () {
                return 'activeRepository'
            }
            $httpBackend.expectGET('rest/monitor/resource');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();

            $interval.flush(2001);
            $httpBackend.flush();
            expect($scope.data.memoryUsage).toEqual([{key: "Used memory", values: [[today, 0.42], [today, '0.2123']]}])

            httpGetResourcesData.respond(200, {
                "heapMemoryUsage": {
                    "max": 1888485376,
                    "committed": 703594496,
                    "init": 134217728,
                    "used": 442264560
                },
                "nonHeapMemoryUsage": {
                    "max": -1,
                    "committed": 124477440,
                    "init": 2555904,
                    "used": 122066392
                },
                "threadCount": 20,
                "cpuLoad": 19.695456009969313,
                "classCount": 13173
            });


            $interval.flush(2000);
            $httpBackend.flush();
            expect($scope.data.memoryUsage).toEqual([{key: "Used memory", values: [[today, 0.88], [today, '0.2123'], [today, '0.4423']]}])
        })

        it('should set data.threadCount[0].values[0][1] if the current value is > than values[0][1]', function () {

            $scope.getActiveRepository = function () {
                return 'activeRepository'
            }
            $httpBackend.expectGET('rest/monitor/resource');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();

            $interval.flush(2001);
            $httpBackend.flush();
            expect($scope.data.threadCount).toEqual([{key: "Thread Count", values: [[today, 40], [today, 20]]}])

            httpGetResourcesData.respond(200, {
                "heapMemoryUsage": {
                    "max": 1888485376,
                    "committed": 703594496,
                    "init": 134217728,
                    "used": 442264560
                },
                "nonHeapMemoryUsage": {
                    "max": -1,
                    "committed": 124477440,
                    "init": 2555904,
                    "used": 122066392
                },
                "threadCount": 52,
                "cpuLoad": 19.695456009969313,
                "classCount": 13173
            });


            $interval.flush(2000);
            $httpBackend.flush();
            expect($scope.data.threadCount).toEqual([{key: "Thread Count", values: [[today, 104], [today, 20], [today, 52]]}])
        })
    });

    describe('$scope.chartOptions', function () {
        it('should return correct data for Y axis', function () {
            $httpBackend.flush();
            $scope.getActiveRepository = function () {
                return false
            }
            expect($scope.chartOptions.chart.yAxis.tickFormat(123)).toEqual(123);
            expect($scope.chartMemoryOptions.chart.yAxis.tickFormat(123)).toEqual('123 GB');
            expect($scope.chartCPUOptions.chart.yAxis.tickFormat(50)).toEqual('50%');
        })
    });

});
