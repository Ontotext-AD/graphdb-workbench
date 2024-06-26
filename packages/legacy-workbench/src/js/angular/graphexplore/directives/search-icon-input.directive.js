angular
    .module('graphdb.framework.graphexplore.directives.searchcontrols', [])
    .directive('searchIconInput', searchIconInputDirective);

searchIconInputDirective.$inject = ['$rootScope', '$timeout'];

function searchIconInputDirective($rootScope, $timeout) {
    return {
        restrict: 'AE',
        scope: {
            searchData: '=',
            searchFields: '@',
            titleField: '@',
            searchPlaceholder: '@',
            initialValue: '=',
            searchedObjCallback: '&'
        },
        templateUrl: 'js/angular/graphexplore/templates/searchIconInputTemplate.html',
        link: function (scope, element) {
            scope.searchedObjCallback = scope.searchedObjCallback();

            scope.performSearchActionOnEnter = function () {
                $rootScope.$broadcast('onEnterKeypressSearchAction');
            };

            scope.showInput = function () {
                $('#selectGraphDropdown').hide();
                element.find('#search_input #search_input_value')[0].value = '';
                element.find('.search-icon')
                    .addClass('animated bounceOut')
                    .css('z-index', '-1');
                element.find('#search_input .angucomplete-holder')
                    .css('display', 'block');
                $timeout(function () {
                    element.find('#search_input .angucomplete-holder')
                        .css('width', '250px')
                        .css('left', '-215px');
                    $timeout(function () {
                        element.find('.close-icon')
                            .css('display', 'block')
                            .addClass('animated bounceIn')
                            .css('z-index', '3');
                        element.find('#search_input #search_input_value')
                            .focus();
                    }, 200);
                }, 1);
            };

            scope.hideInput = function () {
                element.find('#search_input #search_input_value')[0].value = '';
                element.find('#search_input .angucomplete-holder')
                    .css('width', '0px')
                    .css('left', '35px');
                $timeout(function () {
                    element.find('#search_input .angucomplete-holder')
                        .css('display', 'none');
                    $('#selectGraphDropdown').show();
                }, 250);
                element.find('.close-icon')
                    .addClass('animated bounceOut')
                    .removeClass('bounceOut')
                    .css('z-index', '-1')
                    .css('display', 'none')
                    // Hack needed to force close close-button tooltip in order not be
                    // visible after icon is switched
                    .click(function () {
                        $('.tooltip').hide();
                    });
                $timeout(function () {
                    element.find('.search-icon')
                        .css('display', 'inline-block')
                        .removeClass('bounceOut')
                        .addClass('bounceIn')
                        .css('z-index', '3');
                }, 200);
            };
        }
    };
}
