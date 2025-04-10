import {GraphQLPlaygroundComponent} from "../../../models/graphql/graphql-playground-component";

const modules = [];
angular
    .module('graphdb.framework.core.directives.graphql-playground', modules)
    .directive('graphqlPlayground', graphqlPlaygroundDirective);

graphqlPlaygroundDirective.$inject = ['$repositories', '$translate', 'MonitoringRestService', 'toastr'];

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
function graphqlPlaygroundDirective($repositories, $translate, MonitoringRestService, toastr) {
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

            /**
             * Handles the event to abort a running query by sending a request to delete the associated SPARQL query.
             * It retrieves the current repository and track alias from the event detail and notifies the user about
             * the query abortion.
             *
             * @param {Object} event - The event object triggered by the abort query action.
             */
            $scope.abortQuery = (event) => {
                const currentRepository = $repositories.getActiveRepository();
                const currentTrackAlias = event.detail.headers['X-GraphDB-Track-Alias'];
                toastr.info($translate.instant('graphql.playground.message.abort_query'));
                MonitoringRestService.deleteQuery(currentTrackAlias, currentRepository);
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
