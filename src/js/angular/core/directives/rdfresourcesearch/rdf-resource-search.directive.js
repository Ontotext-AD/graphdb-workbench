angular
    .module('graphdb.framework.core.directives.rdfresourcesearch.rdfresourcesearch', [])
    .directive('rdfResourceSearch', rdfResourceSearchDirective);

rdfResourceSearchDirective.$inject = ['$rootScope', '$timeout',
  'AutocompleteRestService', 'RDF4JRepositoriesRestService',
  'RepositoriesRestService', '$repositories', '$location', 'toastr'];

function rdfResourceSearchDirective($rootScope, $timeout,
    AutocompleteRestService, RDF4JRepositoriesRestService,
    RepositoriesRestService, $repositories, $location, toastr) {
  return {
    templateUrl: 'js/angular/core/directives/rdfresourcesearch/templates/rdfResourceSearchTemplate.html',
    restrict: 'AE',
    link: function ($scope, element) {

      function refreshRepositoryInfo() {
        if ($scope.getActiveRepository()) {
          $scope.getNamespacesPromise = RDF4JRepositoriesRestService.getNamespaces(
              $scope.getActiveRepository())
              .success(function () {
                checkAutocompleteStatus();
              });
        }
      }

      function checkAutocompleteStatus() {
        $scope.getAutocompletePromise = AutocompleteRestService.checkAutocompleteStatus();
      }

      $scope.$on('autocompleteStatus', function() {
        checkAutocompleteStatus();
      });

      // Rather then rely on securityInit we monitory repositoryIsSet which is guaranteed to be called
      // after security was initialized. This way we avoid a race condition when the newly logged in
      // user doesn't have read access to the active repository.
      $scope.$on('repositoryIsSet', refreshRepositoryInfo);

      $scope.getActiveRepository = function () {
        return $repositories.getActiveRepository();
      };

      $scope.showInput = function () {
        if (!$scope.isHomePage()) {
            element.find('.search-rdf-btn')
                .addClass('hidden-xs-up');
            element.find('.search-rdf-input').addClass('show-rdf-search-box');
            $timeout(function () {
                element.find('.close-rdf-search-btn').removeClass('hidden-xs-up');
                element.find('search-resource-input .view-res-input').focus();
                window.addEventListener('mousedown', onWindowClick);
            }, 200);
        } else {
           $('#search-resource-input-home input').focus();
            toastr.info('Use <b>View resource</b> on this page', 'Search RDF resources', {
                allowHtml: true
            });
        }
      };

      $scope.hideInput = function () {
        element.find('.search-rdf-input').removeClass('show-rdf-search-box');
        element.find('.close-rdf-search-btn').addClass('hidden-xs-up');
        $timeout(function () {
          element.find('.search-rdf-btn').removeClass('hidden-xs-up');
          element.blur();
          window.removeEventListener('mousedown', onWindowClick);
        }, 200);
      };

      function onWindowClick(event) {
        if (!(event.target.id === "search-box" || $(event.target).closest("#search-box").length)) {
          $scope.hideInput();
        }
      }

      $scope.onKeyDown = function(event) {
        if (event.keyCode === 27) {
          $scope.hideInput();
        }
      };

      $scope.isHomePage = function() {
        return $location.url() === '/';
      }
    }
  };
}
