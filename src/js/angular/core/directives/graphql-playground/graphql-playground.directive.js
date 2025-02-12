import {GraphQLPlaygroundComponent} from "../../../models/graphql/graphql-playground-component";

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
 *  <graphql-playground configuration="myGraphQLConfiguration"></graphql-playground>
 *  ```
 *
 *  ### Controller Example:
 *  ```javascript
 *  angular.module('myApp', [])
 *    .controller('ExampleController', function($scope) {
 *        $scope.myGraphQLConfiguration = {
 *            endpoint: 'https://myapi.com/graphql'
 *        }
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
            configuration: '='
        },
        link: ($scope, element, attrs) => {
            // =========================
            // Public function
            // =========================
            /**
             * Getter for GraphQl playground component.
             * @return {GraphQLPlaygroundComponent}
             */
            $scope.getGraphQLPlaygroundComponent = () => {
                return new GraphQLPlaygroundComponent(getGraphQLPlaygroundElements()[0]);
            };

            // =========================
            // Private function
            // =========================
            const getGraphQLPlaygroundElements = () => {
                return element.find('graphql-playground-component');
            };
        }
    };
}
