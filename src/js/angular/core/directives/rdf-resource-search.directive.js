angular
    .module('graphdb.framework.core.directives.rdfresourcesearch', [])
    .directive('rdfResourceSearch', rdfResourceSearchDirective);

rdfResourceSearchDirective.$inject = ['$rootScope', '$timeout',
  'AutocompleteRestService', 'RDF4JRepositoriesRestService',
  'RepositoriesRestService', '$repositories'];

function rdfResourceSearchDirective($rootScope, $timeout,
    AutocompleteRestService, RDF4JRepositoriesRestService,
    RepositoriesRestService, $repositories) {
  return {
    templateUrl: 'js/angular/core/templates/rdfResourceSearchTemplate.html',
    restrict: 'AE',
    link: function ($scope, element) {

      function refreshRepositoryInfo() {
        if ($scope.getActiveRepository()) {
          $scope.getNamespacesPromise = RDF4JRepositoriesRestService.getNamespaces(
              $scope.getActiveRepository())
              .success(function () {
                $scope.getAutocompletePromise = AutocompleteRestService.checkAutocompleteStatus();
              });
        }
      }

      // Rather then rely on securityInit we monitory repositoryIsSet which is guaranteed to be called
      // after security was initialized. This way we avoid a race condition when the newly logged in
      // user doesn't have read access to the active repository.
      $scope.$on('repositoryIsSet', refreshRepositoryInfo);

      $scope.getActiveRepository = function () {
        return $repositories.getActiveRepository();
      };

      $scope.showInput = function () {
        element.find('.search-rdf-icon')
            .removeClass('show-search-btn')
            .addClass('hide-search-btn');
        element.find('.search_inputRDF').css('top', '0px');
        $timeout(function () {
          element.find('.close-rdf-icon')
              .removeClass('hide-search-btn')
              .addClass('show-search-btn');
          element.find('search-resource-input .view-res-input')
              .focus();
        }, 200);
      };

      $scope.hideInput = function () {
        element.find('.search_inputRDF').css('top', '-150px');
        element.find('search-resource-input .view-res-input')[0].value = '';
        element.find('search-resource-input .view-res-input').change();
        element.find('.close-rdf-icon')
            .removeClass('show-search-btn')
            .addClass('hide-search-btn');
        $timeout(function () {
          element.find('.search-rdf-icon')
              .removeClass('hide-search-btn')
              .addClass('show-search-btn')
              .css('z-index', '3');
        }, 200);
      };
    }
  };
}
