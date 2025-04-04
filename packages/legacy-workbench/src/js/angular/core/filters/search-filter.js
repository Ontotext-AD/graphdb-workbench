/**
 * @ngdoc filter
 * @name graphdb.framework.core.filters.searchFilter:searchFilter
 * @function
 * @description
 * A filter that searches for a text within the label property of items in an array.
 *
 * @param {Array} items - The array of items to filter.
 * @param {string} searchText - The text to search for within the label property of each item.
 * @returns {Array} The filtered array of items that contain the searchText in their label.
 */
angular
    .module('graphdb.framework.core.filters.searchFilter', [])
    .filter('searchFilter', function() {
        return function(items, searchText) {
            if (!searchText) {
                return items;
            }
            return items.filter(item => item.label.toLowerCase().includes(searchText.toLowerCase()));
        };
    });
