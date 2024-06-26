angular.module('graphdb.framework.core.services.autocompleteStatus', [])
    .service('$autocompleteStatus', ['$rootScope', 'AutocompleteRestService', 'LocalStorageAdapter', 'LSKeys', '$repositories', autocompleteStatusService]);

function autocompleteStatusService($rootScope, AutocompleteRestService, LocalStorageAdapter, LSKeys, $repositories) {
  const that = this;

  this.setAutocompleteStatus = function (status) {
    LocalStorageAdapter.set(LSKeys.AUTOCOMPLETE_ENABLED, status);
    $rootScope.$broadcast('autocompleteStatus', status);
  };

  $rootScope.$watch(function () {
    return LocalStorageAdapter.get(LSKeys.AUTOCOMPLETE_ENABLED);
  }, function (value) {
    that.setAutocompleteStatus(value);
  }, true);

  function refreshAutocompleteStatus() {
      // Autocomplete is related with an active repository
      if (!$repositories.getActiveRepository() ||
            $repositories.isActiveRepoOntopType() ||
                $repositories.isActiveRepoFedXType()) {
          return;
      }
    AutocompleteRestService.checkAutocompleteStatus()
        .success(function (autocompleteStatusResponse) {
          that.setAutocompleteStatus(autocompleteStatusResponse);
        });
  }

  $rootScope.$on('repositoryIsSet', refreshAutocompleteStatus);
}
