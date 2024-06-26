angular
    .module('graphdb.framework.graphexplore.directives.searchfilter', [])
    .directive('listItemsSearchFilter', listItemsSearchFilterDirective);

listItemsSearchFilterDirective.$inject = [];

function listItemsSearchFilterDirective() {
    return {
        restrict: 'AE',
        scope: {
            filterQueryObj: '=',
            filterFunction: '&',
            listItemsObj: '=',
            listItemsNotFiltered: '=',
            searchPlaceholder: '@'
        },
        templateUrl: 'js/angular/graphexplore/templates/listItemsSearchFilterTemplate.html',
        link: function (scope) {

            function filter(searchQuery, data, nonFilteredData, customFilter) {
                if (searchQuery.length > 0) {
                    return _.filter(nonFilteredData, customFilter);
                } else if (data.length !== nonFilteredData.length) {
                    return nonFilteredData;
                }
                return data;
            }

            // unwrap callback filter function
            scope.filterFunction = scope.filterFunction();

            scope.$watch('filterQueryObj.query', function () {
                scope.listItemsObj.items = filter(
                    scope.filterQueryObj.query,
                    scope.listItemsObj.items,
                    scope.listItemsNotFiltered,
                    scope.filterFunction);
            });
        }
    };
}
