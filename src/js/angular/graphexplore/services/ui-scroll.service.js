angular
    .module('graphdb.framework.graphexplore.services.uiscroll', [])
    .factory('UiScrollService', UiScrollService);

UiScrollService.$inject = ['$timeout'];

function UiScrollService($timeout) {
    return {
        initLazyList: initLazyList
    };

    function initLazyList(index, count, success, position, data) {
        return $timeout(function () {
            const actualIndex = index + position - 1;
            const start = Math.max(0 - position, actualIndex);
            const end = Math.min(actualIndex + count - 1, data.length);
            if (start > end) {
                success([]);
            } else if ($.isArray(data)) {
                success(data.slice(start, end + 1));
            }
        }, 100, true);
    }
}
