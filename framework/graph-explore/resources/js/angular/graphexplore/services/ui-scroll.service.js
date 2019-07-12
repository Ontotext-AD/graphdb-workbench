define([],
    function () {

        angular
            .module('graphdb.framework.graphexplore.services.uiscroll', [])
            .factory('UiScrollService', UiScrollService);

        UiScrollService.$inject = ['$http', '$timeout'];
        function UiScrollService($http, $timeout) {
            return {
                initLazyList: initLazyList
            };

            function initLazyList(index, count, success, position, data) {
                return $timeout(function () {
                    var actualIndex = index + position - 1;
                    var start = Math.max(0 - position, actualIndex);
                    var end = Math.min(actualIndex + count - 1, data.length);
                    if (start > end) {
                        success([]);
                    } else if ($.isArray(data)) {
                        success(data.slice(start, end + 1));
                    }
                }, 100, true);
            }
        }
    });
