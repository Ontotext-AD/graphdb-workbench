import "angular/core/services";
import 'angular/core/services/repositories.service';
import "angular/resources/controllers";
import {bundle} from "../test-main";

beforeEach(angular.mock.module('graphdb.framework.jmx.resources.controllers', function ($provide) {
    $provide.constant("productInfo", {
        "productType": "standard", "productVersion": "7.0", "sesame": "2.9.0", "connectors": "5.0.0"
    });
}));

describe('=> ResourcesCtrl tests', function () {
    var $httpBackend,
        $controller,
        $timeout,
        $scope,
        $repositories,
        httpGetResourcesData;
        let $translate;

    beforeEach(angular.mock.inject(function (_$httpBackend_, _$repositories_, _$location_, _$controller_, _$window_, _$timeout_, $rootScope, _$translate_) {

        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        $timeout = _$timeout_;
        $repositories = _$repositories_;
        $translate = _$translate_;

        $translate.instant = function (key, modification) {
            if (modification) {
                let modKey = Object.keys(modification)[0];
                return bundle[key].replace(`{{${modKey}}}`, modification[modKey]);
            }
            return bundle[key];
        };

        httpGetResourcesData = $httpBackend.when('GET', 'rest/monitor/infrastructure').respond(200, {
            "heapMemoryUsage": {
                "max": 1888485376,
                "committed": 703594496,
                "init": 134217728,
                "used": 212264560,
                "free": 16609443840
            },
            "nonHeapMemoryUsage": {
                "max": -1,
                "committed": 124477440,
                "init": 2555904,
                "used": 122066392,
                "free": -183684985
            },
            "storageMemory": {
                "dataDirUsed": 174259171328,
                "workDirUsed": 174259171328,
                "logsDirUsed": 174259171328,
                "dataDirFree": 7743021056,
                "workDirFree": 7743021056,
                "logsDirFree": 7743021056
            },
            "threadCount": 20,
            "cpuLoad": 19.695456009969313,
            "classCount": 13173,
            "gcCount": 15,
            "openFileDescriptors": 550
        });

        $httpBackend.when('GET', 'rest/security/all').respond(200, {
            enabled: false,
            freeAcesss: {enabled: false},
            overrideAuth: {enabled: false}
        });
        $httpBackend.when('GET', 'rest/locations/active').respond(200, {locationUri: ''});
        $httpBackend.when('GET', 'rest/security/users/admin').respond(200, {
            username: 'admin',
            appSettings: {'DEFAULT_INFERENCE': true, 'DEFAULT_SAMEAS': true, 'EXECUTE_COUNT': true},
            authorities: ['ROLE_ADMIN']
        });

        $httpBackend.when('GET', 'rest/locations').respond(200, {});

        $scope = $rootScope.$new();
        $controller('ResourcesCtrl', {$scope: $scope});

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

            $httpBackend.expectGET('rest/monitor/infrastructure')
            $timeout.flush(2001);
            expect($httpBackend.flush).not.toThrow();
            $timeout.flush(2000);
            expect($httpBackend.flush).not.toThrow();
            $timeout.flush(2000);
            expect($httpBackend.flush).not.toThrow();
        });

        it('should set resource monitor charts data correct', function () {
            $scope.getActiveRepository = function () {
                return 'activeRepository'
            }
            $httpBackend.expectGET('rest/monitor/infrastructure');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();

            $timeout.flush(2001);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.cpuLoad.dataHolder).toEqual([{key: "System CPU Load", values: [[today, '19.6955']]}])
            expect($scope.resourceMonitorData.fileDescriptors.dataHolder).toEqual([{key: "Open file descriptors", area: 'true', values: [[today, 550]]}])
            expect($scope.resourceMonitorData.heapMemory.dataHolder).toEqual([{key: "Committed memory", values: [[today, 703594496]]}, {key: 'Used memory', area: 'true', values: [[today, 212264560]]}])
            expect($scope.resourceMonitorData.offHeapMemory.dataHolder).toEqual([{key: "Committed memory", values: [[today, 124477440]]}, {key: 'Used memory', area: 'true', values: [[today, 122066392]]}])
            expect($scope.resourceMonitorData.diskStorage.dataHolder).toEqual([{key: "Used", values: [['Data', 0.9574564407462561], ['Work',0.9574564407462561], ['Logs', 0.9574564407462561]]}, {key: 'Free', values: [['Data', 0.042543559253743896], ['Work', 0.042543559253743896], ['Logs', 0.042543559253743896]]}])
            $timeout.flush(2000);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.cpuLoad.dataHolder).toEqual([{key: "System CPU Load", values: [[today, '19.6955'], [today, '19.6955']]}])
            expect($scope.resourceMonitorData.fileDescriptors.dataHolder).toEqual([{key: "Open file descriptors", area: 'true', values: [[today, 550], [today, 550]]}])
            expect($scope.resourceMonitorData.heapMemory.dataHolder).toEqual([{key: "Committed memory", values: [[today, 703594496], [today, 703594496]]}, {key: 'Used memory', area: 'true', values: [[today, 212264560], [today, 212264560]]}])
            expect($scope.resourceMonitorData.offHeapMemory.dataHolder).toEqual([{key: "Committed memory", values: [[today, 124477440], [today, 124477440]]}, {key: 'Used memory', area: 'true', values: [[today, 122066392], [today, 122066392]]}])
            expect($scope.resourceMonitorData.diskStorage.dataHolder).toEqual([{key: "Used", values: [['Data', 0.9574564407462561], ['Work',0.9574564407462561], ['Logs', 0.9574564407462561]]}, {key: 'Free', values: [['Data', 0.042543559253743896], ['Work', 0.042543559253743896], ['Logs', 0.042543559253743896]]}])
        });

        it('should set cpuLoad yDomain to 0, 100 if the current value is above 50', function () {

            $scope.getActiveRepository = function () {
                return 'activeRepository'
            }
            $httpBackend.expectGET('rest/monitor/infrastructure');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();

            $timeout.flush(2001);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.cpuLoad.dataHolder).toEqual([{key: "System CPU Load", values: [[today, '19.6955']]}])
            expect($scope.resourceMonitorData.cpuLoad.chartOptions.chart.yDomain).toEqual([0, 39.391])

            httpGetResourcesData.respond(200, {
                "heapMemoryUsage": {
                    "max": 1888485376,
                    "committed": 703594496,
                    "init": 134217728,
                    "used": 212264560,
                    "free": 16609443840
                },
                "nonHeapMemoryUsage": {
                    "max": -1,
                    "committed": 124477440,
                    "init": 2555904,
                    "used": 122066392,
                    "free": -183684985
                },
                "storageMemory": {
                    "dataDirUsed": 174259171328,
                    "workDirUsed": 174259171328,
                    "logsDirUsed": 174259171328,
                    "dataDirFree": 7743021056,
                    "workDirFree": 7743021056,
                    "logsDirFree": 7743021056
                },
                "threadCount": 20,
                "cpuLoad": 51.6955,
                "classCount": 13173,
                "gcCount": 15,
                "openFileDescriptors": 550
            });


            $timeout.flush(2000);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.cpuLoad.dataHolder).toEqual([{key: "System CPU Load", values: [[today, '19.6955'], [today, '51.6955']]}])
            expect($scope.resourceMonitorData.cpuLoad.chartOptions.chart.yDomain).toEqual([0, 100])
        });

        it('should set file descriptors yDomain to 0, max*2', function () {

            $scope.getActiveRepository = function () {
                return 'activeRepository'
            }
            $httpBackend.expectGET('rest/monitor/infrastructure');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();

            $timeout.flush(2001);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.fileDescriptors.dataHolder).toEqual([{key: "Open file descriptors", area: 'true', values: [[today, 550]]}])
            expect($scope.resourceMonitorData.fileDescriptors.chartOptions.chart.yDomain).toEqual([0, 1100])

            httpGetResourcesData.respond(200, {
                "heapMemoryUsage": {
                    "max": 1888485376,
                    "committed": 703594496,
                    "init": 134217728,
                    "used": 212264560,
                    "free": 16609443840
                },
                "nonHeapMemoryUsage": {
                    "max": -1,
                    "committed": 124477440,
                    "init": 2555904,
                    "used": 122066392,
                    "free": -183684985
                },
                "storageMemory": {
                    "dataDirUsed": 174259171328,
                    "workDirUsed": 174259171328,
                    "logsDirUsed": 174259171328,
                    "dataDirFree": 7743021056,
                    "workDirFree": 7743021056,
                    "logsDirFree": 7743021056
                },
                "threadCount": 20,
                "cpuLoad": 51.6955,
                "classCount": 13173,
                "gcCount": 15,
                "openFileDescriptors": 600
            });


            $timeout.flush(2000);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.fileDescriptors.chartOptions.chart.yDomain).toEqual([0, 1200])
        })

        it('should set heap memory yDomain to 0, max*1.2', function () {

            $scope.getActiveRepository = function () {
                return 'activeRepository'
            }
            $httpBackend.expectGET('rest/monitor/infrastructure');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();

            $timeout.flush(2001);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.heapMemory.dataHolder).toEqual([{key: "Committed memory", values: [[today, 703594496]]}, {key: 'Used memory', area: 'true', values: [[today, 212264560]]}])
            expect($scope.resourceMonitorData.heapMemory.chartOptions.chart.yDomain).toEqual([0, 703594496*1.2])

            httpGetResourcesData.respond(200, {
                "heapMemoryUsage": {
                    "max": 1888485376,
                    "committed": 783594496,
                    "init": 134217728,
                    "used": 212264560,
                    "free": 16609443840
                },
                "nonHeapMemoryUsage": {
                    "max": -1,
                    "committed": 124477440,
                    "init": 2555904,
                    "used": 122066392,
                    "free": -183684985
                },
                "storageMemory": {
                    "dataDirUsed": 174259171328,
                    "workDirUsed": 174259171328,
                    "logsDirUsed": 174259171328,
                    "dataDirFree": 7743021056,
                    "workDirFree": 7743021056,
                    "logsDirFree": 7743021056
                },
                "threadCount": 20,
                "cpuLoad": 51.6955,
                "classCount": 13173,
                "gcCount": 15,
                "openFileDescriptors": 600
            });


            $timeout.flush(2000);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.heapMemory.chartOptions.chart.yDomain).toEqual([0, 783594496*1.2])
        })

        it('should set non-heap memory yDomain to 0, max*1.2', function () {

            $scope.getActiveRepository = function () {
                return 'activeRepository'
            }
            $httpBackend.expectGET('rest/monitor/infrastructure');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();

            $timeout.flush(2001);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.offHeapMemory.dataHolder).toEqual([{key: "Committed memory", values: [[today, 124477440]]}, {key: 'Used memory', area: 'true', values: [[today, 122066392]]}])
            expect($scope.resourceMonitorData.offHeapMemory.chartOptions.chart.yDomain).toEqual([0, 124477440*1.2])

            httpGetResourcesData.respond(200, {
                "heapMemoryUsage": {
                    "max": 1888485376,
                    "committed": 783594496,
                    "init": 134217728,
                    "used": 212264560,
                    "free": 16609443840
                },
                "nonHeapMemoryUsage": {
                    "max": -1,
                    "committed": 164477440,
                    "init": 2555904,
                    "used": 122066392,
                    "free": -183684985
                },
                "storageMemory": {
                    "dataDirUsed": 174259171328,
                    "workDirUsed": 174259171328,
                    "logsDirUsed": 174259171328,
                    "dataDirFree": 7743021056,
                    "workDirFree": 7743021056,
                    "logsDirFree": 7743021056
                },
                "threadCount": 20,
                "cpuLoad": 51.6955,
                "classCount": 13173,
                "gcCount": 15,
                "openFileDescriptors": 600
            });


            $timeout.flush(2000);
            $httpBackend.flush();
            expect($scope.resourceMonitorData.offHeapMemory.chartOptions.chart.yDomain).toEqual([0, 164477440*1.2])
        })
    });

    describe('$scope.chartOptions', function () {
        it('should return correct data for Y axis', function () {
            httpGetResourcesData.respond(200, {
                "heapMemoryUsage": {
                    "max": 1888485376,
                    "committed": 8589934592,
                    "init": 134217728,
                    "used": 212264560,
                    "free": 16609443840
                },
                "nonHeapMemoryUsage": {
                    "max": -1,
                    "committed": 164477440,
                    "init": 2555904,
                    "used": 122066392,
                    "free": -183684985
                },
                "storageMemory": {
                    "dataDirUsed": 174259171328,
                    "workDirUsed": 174259171328,
                    "logsDirUsed": 174259171328,
                    "dataDirFree": 7743021056,
                    "workDirFree": 7743021056,
                    "logsDirFree": 7743021056
                },
                "threadCount": 20,
                "cpuLoad": 51.6955,
                "classCount": 13173,
                "gcCount": 15,
                "openFileDescriptors": 600
            });

            $scope.getActiveRepository = function () {
                return 'activeRepository'
            }
            $httpBackend.expectGET('rest/monitor/infrastructure');

            var fixedDate = new Date('1999-01-02');
            jasmine.clock().mockDate(fixedDate);
            var today = new Date();

            $timeout.flush(2001);
            $httpBackend.flush();

            expect($scope.resourceMonitorData.cpuLoad.chartOptions.chart.yAxis.tickFormat(123)).toEqual('123%');
            expect($scope.resourceMonitorData.fileDescriptors.chartOptions.chart.yAxis.tickFormat(50)).toEqual(50);
            expect($scope.resourceMonitorData.heapMemory.chartOptions.chart.yAxis.tickFormat(8589934592)).toEqual('8.00 GB');
            expect($scope.resourceMonitorData.offHeapMemory.chartOptions.chart.yAxis.tickFormat(265289728)).toEqual('253.00 MB');
            expect($scope.resourceMonitorData.diskStorage.chartOptions.chart.yAxis.tickFormat(0.5)).toEqual('50.00%');
        })
    });

});
