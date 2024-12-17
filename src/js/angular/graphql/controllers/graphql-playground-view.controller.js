const modules = [];

angular
    .module('graphdb.framework.graphql.controllers.graphql-playground-view', modules)
    .controller('GraphqlPlaygroundViewCtrl', GraphqlPlaygroundViewCtrl);

GraphqlPlaygroundViewCtrl.$inject = ['$scope', '$repositories'];

function GraphqlPlaygroundViewCtrl($scope, $repositories) {
    // not implemented
    $scope.graphqlEndpoint = '/rest/repositories/test/graphql/swapi';
    $scope.getActiveRepositoryNoError = () => {
        return $repositories.getActiveRepository();
    };
}
