angular.module('graphdb.framework.core.services.autocompleteStatus', [])
    .service('$autocompleteStatus', ['$rootScope', 'AutocompleteRestService', 'LocalStorageAdapter', 'LSKeys', autocompleteStatusService]);

function autocompleteStatusService($rootScope, AutocompleteRestService, LocalStorageAdapter, LSKeys) {
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
    AutocompleteRestService.checkAutocompleteStatus()
        .success(function (autocompleteStatusResponse) {
          that.setAutocompleteStatus(autocompleteStatusResponse);
        });
  }

  $rootScope.$on('repositoryIsSet', refreshAutocompleteStatus);
}
