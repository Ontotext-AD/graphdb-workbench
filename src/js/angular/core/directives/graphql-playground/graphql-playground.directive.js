import {isEqual} from "lodash/lang";

const modules = [];
angular
    .module('graphdb.framework.core.directives.graphql-playground', modules)
    .directive('graphqlPlayground', graphqlPlaygroundDirective);

graphqlPlaygroundDirective.$inject = [];

/**
 * @function graphqlPlaygroundDirective
 * @description
 * Directive to create and manage a GraphQL Playground component.
 *
 * @example
 *  ### HTML Usage:
 *  The directive can be used in the Workbench as follows:
 *  ```html
 *  <graphql-playground graphql-endpoint="myGraphQLEndpoint"></graphql-playground>
 *  ```
 *
 *  ### Controller Example:
 *  ```javascript
 *  angular.module('myApp', [])
 *    .controller('ExampleController', function($scope) {
 *        $scope.myGraphQLEndpoint = 'https://myapi.com/graphql';
 *    });
 *  ```
 *
 * @return {Object} Directive definition object.
 */
function graphqlPlaygroundDirective() {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/core/directives/graphql-playground/templates/graphql-playground.html',
        scope: {
            graphqlEndpoint: '='
        },
        link: ($scope, element, attrs) => {
            $scope.endpoint = '';
            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            const init = (newVal, oldValue) => {
                if (!$scope.endpoint && newVal || newVal && !isEqual(newVal, oldValue)) {
                    $scope.endpoint = newVal;
                }
            };

            subscriptions.push($scope.$watch('graphqlEndpoint', init));

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

        }
    };
}
