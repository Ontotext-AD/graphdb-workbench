(function() {
    angular.module('graphdb.framework.core.directives.multiselect', [])
        .directive('multiSelectDropdown', function() {
            return {
                restrict: 'E',
                scope: {
                    items: '=',
                    placeholder: '@?',
                    onChange: '&?',
                    /**
                     * Keys for labels used in the multiselect dropdown.
                     * <code>
                     * {
                     *    "select_all": "All",
                     *    "search_placeholder": "Select options",
                     *    "selected_count": "{{count}} selected",
                     *    "no_matches": "No matches"
                     * }
                     * </code>
                     */
                    labelKeys: '=?',
                },
                templateUrl: 'js/angular/core/directives/multiselect-search/templates/multiselect-search.html',
                controller: ['$scope', '$document', '$element', '$filter', '$timeout', function($scope, $document, $element, $filter, $timeout) {
                    // =========================
                    // Public variables
                    // =========================

                    $scope.open = false;
                    $scope.search = {query: ''};
                    $scope.visibleItems = [];

                    // =========================
                    // Private variables
                    // =========================

                    const subscriptions = [];

                    // =========================
                    // Private functions
                    // =========================

                    /**
                     * Normalize string for searching.
                     * @param v {string|null}
                     * @returns {string|string}
                     */
                    const normalize = (v) => {
                        return v === null ? '' : ('' + v).toLowerCase();
                    };

                    /**
                     * Build filtered list when query or items change.
                     */
                    const rebuildFiltered = () => {
                        const list = Array.isArray($scope.items) ? $scope.items : [];
                        const normalizedQuery = normalize($scope.search.query);
                        if (normalizedQuery) {
                            $scope.visibleItems = list.filter((i) => normalize(i.label).includes(normalizedQuery));
                        } else {
                            $scope.visibleItems = list;
                        }
                    };

                    const dropTheOpenFlag = () => {
                        $scope.$applyAsync(function() {
                            $scope.open = false;
                        });
                    };

                    /**
                     * Closes the menu when clicking outside.
                     * @param e {MouseEvent} The click event.
                     */
                    const onDocClick = (e) => {
                        if (!$scope.open) {
                            return;
                        }
                        if (!$element[0].contains(e.target)) {
                            dropTheOpenFlag();
                        }
                    };

                    const focusSearchInput = () => {
                        // wait for the menu to open before focusing the input
                        $timeout(function() {
                            const input = $element[0].querySelector('.multiselect-search');
                            if (input) {
                                input.focus();
                            }
                        });
                    };

                    const focusMultiselectButton = () => {
                        // wait for the menu to be removed before focusing the button
                        $timeout(function() {
                            const btn = $element[0].querySelector('.multiselect-button');
                            if (btn) {
                                btn.focus();
                            }
                        });
                    };

                    // =========================
                    // Public functions
                    // =========================

                    /**
                     * Toggles the menu open/closed.
                     * @param e {MouseEvent} The click event.
                     */
                    $scope.toggleOpen = function(e) {
                        e && e.stopPropagation();
                        $scope.open = !$scope.open;
                        if ($scope.open) {
                            focusSearchInput();
                        }
                    };

                    /**
                     * Handles keydown events in the menu (for Escape key) and closes the menu.
                     * @param e {KeyboardEvent} The keydown event.
                     */
                    $scope.onKeydownMenu = function(e) {
                        if (e.key === 'Escape') {
                            $scope.open = false;
                            e.stopPropagation();
                            e.preventDefault();
                            focusMultiselectButton();
                        }
                    };

                    /**
                     * Gets count of selected items.
                     * @returns {*|number}
                     */
                    $scope.selectedCount = function() {
                        if (!Array.isArray($scope.items)) {
                            return 0;
                        }
                        return $scope.items.filter((i) => i.selected).length;
                    };

                    /**
                     * Checks if all filtered items are selected.
                     * @returns {this is T[]|boolean}
                     */
                    $scope.allFilteredSelected = function() {
                        const list = $scope.visibleItems || [];
                        if (list.length === 0) {
                            return false;
                        }
                        return list.every((i) => i.selected);
                    };

                    /**
                     * Checks if some (but not all) filtered items are selected.
                     * @returns {boolean}
                     */
                    $scope.someFilteredSelected = function() {
                        const list = $scope.visibleItems || [];
                        const any = list.some((i) => i.selected);
                        const all = list.every((i) => i.selected);
                        return any && !all;
                    };

                    /**
                     * Toggles select all filtered items.
                     * @param e {MouseEvent} The click event.
                     */
                    $scope.toggleSelectAll = function(e) {
                        e && e.stopPropagation();
                        const list = $scope.visibleItems || [];
                        const makeSelected = !$scope.allFilteredSelected();
                        for (const item of list) {
                            item.selected = makeSelected;
                        }
                        $scope.emitChange();
                    };

                    /**
                     * Emits change event.
                     */
                    $scope.emitChange = function() {
                        if (typeof $scope.onChange === 'function') {
                            const selected = ($scope.items || []).filter((i) => i.selected);
                            $scope.onChange({selected: selected});
                        }
                    };

                    // =========================
                    // Watches & Listeners
                    // =========================

                    $document.on('click', onDocClick);
                    subscriptions.push(
                        $scope.$watch('search.query', rebuildFiltered),
                        $scope.$watchCollection('items', rebuildFiltered),
                    );

                    const onDestroyCallback = () => {
                        $document.off('click', onDocClick);
                        for (const unsubscribe of subscriptions) {
                            unsubscribe();
                        }
                    };
                    $scope.$on('$destroy', onDestroyCallback);

                    rebuildFiltered();
                }],
            };
        });
})();
